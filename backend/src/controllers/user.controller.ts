import type { Request, Response } from "express";
import { defaultModelFor } from "../config/ai.config.js";
import { Generation } from "../models/Generation.model.js";
import { toUserAISettingsResponse } from "../services/ai/config.js";
import { getUsageStatus } from "../services/usage.service.js";
import { ok } from "../utils/responses.js";
import { UnauthorizedError, NotFoundError } from "../utils/errors.js";
import type { UpdateAISettingsInput } from "../validators/user.validator.js";

/** GET /api/user/usage */
export const getMyUsage = (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  return ok(res, getUsageStatus(req.user));
};

/** GET /api/user/ai-settings */
export const getMyAISettings = (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  return ok(res, toUserAISettingsResponse(req.user));
};

/** PUT /api/user/ai-settings */
export const updateMyAISettings = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const input = req.body as UpdateAISettingsInput;

  req.user.aiSettings ??= {
    aiProvider: "openai-compatible",
    aiModel: defaultModelFor("openai-compatible"),
  };

  if (input.aiProvider !== undefined) {
    req.user.aiSettings.aiProvider = input.aiProvider;
    if (input.aiModel === undefined) {
      req.user.aiSettings.aiModel = defaultModelFor(input.aiProvider);
    }
  }
  if (input.aiModel !== undefined) req.user.aiSettings.aiModel = input.aiModel;
  if (input.aiBaseUrl !== undefined) {
    req.user.aiSettings.aiBaseUrl = input.aiBaseUrl === "" ? undefined : input.aiBaseUrl;
  }
  if (input.aiApiKey !== undefined) {
    req.user.aiSettings.aiApiKey = input.aiApiKey === "" ? undefined : input.aiApiKey;
  }

  req.user.markModified("aiSettings");
  await req.user.save();

  return ok(res, toUserAISettingsResponse(req.user), "AI settings saved");
};

/** GET /api/user/history?page=1&limit=20&toolId=xxx */
export const getMyHistory = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { page = 1, limit = 20, toolId } = req.query as {
    page?: number;
    limit?: number;
    toolId?: string;
  };

  const filter: Record<string, unknown> = {
    user: req.user._id,
    status: "active",
  };
  if (toolId) filter.toolId = toolId;

  const [items, total] = await Promise.all([
    Generation.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Generation.countDocuments(filter),
  ]);

  return ok(res, {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

/** DELETE /api/user/history/:id — soft delete */
export const deleteHistoryItem = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const item = await Generation.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) throw new NotFoundError("History item not found");
  item.status = "deleted";
  await item.save();
  return ok(res, null, "Deleted");
};

/** DELETE /api/user/history — soft delete all (optionally filtered by toolId) */
export const clearHistory = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { toolId } = req.query as { toolId?: string };
  const filter: Record<string, unknown> = { user: req.user._id, status: "active" };
  if (toolId) filter.toolId = toolId;
  const result = await Generation.updateMany(filter, { $set: { status: "deleted" } });
  return ok(res, { deleted: result.modifiedCount }, "Cleared");
};
