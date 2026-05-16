import type { Request, Response } from "express";
import { defaultModelFor } from "../config/ai.config.js";
import { env } from "../config/env.js";
import { Generation } from "../models/Generation.model.js";
import { GrowthReport } from "../models/GrowthReport.model.js";
import { Note } from "../models/Note.model.js";
import { Project } from "../models/Project.model.js";
import { Resume } from "../models/Resume.model.js";
import { ensureSettings, type SettingsDocument } from "../models/Settings.model.js";
import { ShortLink } from "../models/ShortLink.model.js";
import { Task } from "../models/Task.model.js";
import { User } from "../models/User.model.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { ok } from "../utils/responses.js";
import type {
  ListUsersQuery,
  UpdateSettingsInput,
  UpdateUserInput,
} from "../validators/admin.validator.js";

function getEnvFallbackConfig() {
  if (env.AI_API_KEY) {
    const provider = env.AI_PROVIDER || "openai";
    return {
      provider,
      model: env.AI_MODEL || defaultModelFor(provider),
      baseUrl: env.AI_BASE_URL || null,
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai" as const,
      model: env.OPENAI_MODEL || env.AI_MODEL || defaultModelFor("openai"),
      baseUrl: env.OPENAI_BASE_URL || null,
    };
  }

  if (env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic" as const,
      model: env.ANTHROPIC_MODEL || env.AI_MODEL || defaultModelFor("anthropic"),
      baseUrl: null,
    };
  }

  const geminiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (geminiKey) {
    return {
      provider: "gemini" as const,
      model: env.GEMINI_MODEL || env.AI_MODEL || defaultModelFor("gemini"),
      baseUrl: null,
    };
  }

  return null;
}

function toSettingsResponse(doc: SettingsDocument) {
  const key = doc.aiApiKey || doc.anthropicApiKey;
  const envFallback = getEnvFallbackConfig();
  const provider = doc.aiProvider || "anthropic";

  return {
    aiProvider: provider,
    aiModel: doc.aiModel || defaultModelFor(provider),
    aiBaseUrl: doc.aiBaseUrl || null,
    hasApiKey: !!key,
    keyPreview: key ? `...${key.slice(-4)}` : null,
    usingEnvFallback: !key && !!envFallback,
    envProvider: !key ? envFallback?.provider ?? null : null,
    envModel: !key ? envFallback?.model ?? null : null,
    envBaseUrl: !key ? envFallback?.baseUrl ?? null : null,
  };
}

export const getStats = async (_req: Request, res: Response) => {
  const startOfTodayUTC = new Date(new Date().toISOString().slice(0, 10));

  const [
    totalUsers,
    verifiedUsers,
    adminUsers,
    planAgg,
    totalGenerations,
    generationsToday,
    topTools,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerified: true }),
    User.countDocuments({ role: "admin" }),
    User.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]),
    Generation.countDocuments({ status: "active" }),
    Generation.countDocuments({
      status: "active",
      createdAt: { $gte: startOfTodayUTC },
    }),
    Generation.aggregate<{ _id: { toolId: string; toolName: string }; count: number }>([
      { $match: { status: "active" } },
      {
        $group: {
          _id: { toolId: "$toolId", toolName: "$toolName" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const planCounts = { free: 0, pro: 0, team: 0 } as Record<string, number>;
  for (const row of planAgg) {
    if (row._id in planCounts) planCounts[row._id] = row.count;
  }

  return ok(res, {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      byPlan: planCounts,
    },
    generations: {
      total: totalGenerations,
      today: generationsToday,
    },
    topTools: topTools.map((tool) => ({
      toolId: tool._id.toolId,
      toolName: tool._id.toolName,
      count: tool.count,
    })),
  });
};

export const listUsers = async (req: Request, res: Response) => {
  const { page, limit, search, role, plan } = req.query as unknown as ListUsersQuery;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (plan) filter.plan = plan;
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ email: regex }, { name: regex }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("email name avatar provider role emailVerified plan usage lastLoginAt createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return ok(res, {
    items: items.map((user) => ({
      id: String(user._id),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      role: user.role ?? "user",
      emailVerified: user.emailVerified ?? false,
      plan: user.plan,
      totalGenerations: user.usage?.total ?? 0,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const updateUser = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { role, plan } = req.body as UpdateUserInput;

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  if (role === "user" && String(user._id) === String(req.user._id)) {
    throw new BadRequestError("You cannot remove your own admin role");
  }

  if (role) user.role = role;
  if (plan) user.plan = plan;
  await user.save();

  return ok(res, { user: user.toPublicJSON() }, "User updated");
};

export const deleteUser = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();

  if (String(req.params.id) === String(req.user._id)) {
    throw new BadRequestError("You cannot delete your own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  await Promise.all([
    Generation.deleteMany({ user: user._id }),
    GrowthReport.deleteMany({ user: user._id }),
    Note.deleteMany({ user: user._id }),
    Project.deleteMany({ user: user._id }),
    Resume.deleteMany({ user: user._id }),
    ShortLink.deleteMany({ user: user._id }),
    Task.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();

  return ok(res, null, "User deleted");
};

export const getSettings = async (_req: Request, res: Response) => {
  const settings = await ensureSettings();
  return ok(res, toSettingsResponse(settings));
};

export const updateSettings = async (req: Request, res: Response) => {
  const { aiProvider, aiApiKey, aiModel, aiBaseUrl } = req.body as UpdateSettingsInput;
  const settings = await ensureSettings();

  if (aiProvider !== undefined) {
    settings.aiProvider = aiProvider;
    if (!settings.aiModel) settings.aiModel = defaultModelFor(aiProvider);
  }
  if (aiApiKey !== undefined) {
    settings.aiApiKey = aiApiKey === "" ? undefined : aiApiKey;
    if (aiApiKey === "") settings.anthropicApiKey = undefined;
  }
  if (aiModel !== undefined) settings.aiModel = aiModel;
  if (aiBaseUrl !== undefined) {
    settings.aiBaseUrl = aiBaseUrl === "" ? undefined : aiBaseUrl;
  }

  await settings.save();

  return ok(res, toSettingsResponse(settings), "Settings updated");
};
