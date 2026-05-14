import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
import { Generation } from "../models/Generation.model.js";
import { ok } from "../utils/responses.js";
import { UnauthorizedError, NotFoundError, BadRequestError } from "../utils/errors.js";
import type { ListUsersQuery, UpdateUserInput } from "../validators/admin.validator.js";

/** GET /api/admin/stats — workspace-wide overview metrics. */
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
    topTools: topTools.map((t) => ({
      toolId: t._id.toolId,
      toolName: t._id.toolName,
      count: t.count,
    })),
  });
};

/** GET /api/admin/users — paginated, filterable user list. */
export const listUsers = async (req: Request, res: Response) => {
  const { page, limit, search, role, plan } = req.query as unknown as ListUsersQuery;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (plan) filter.plan = plan;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ email: rx }, { name: rx }];
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
    items: items.map((u) => ({
      id: String(u._id),
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      provider: u.provider,
      // Pre-existing docs may predate the role field; .lean() skips schema defaults.
      role: u.role ?? "user",
      emailVerified: u.emailVerified ?? false,
      plan: u.plan,
      totalGenerations: u.usage?.total ?? 0,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/** PATCH /api/admin/users/:id — update a user's role and/or plan. */
export const updateUser = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { role, plan } = req.body as UpdateUserInput;

  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");

  // Guard against an admin locking themselves out.
  if (role === "user" && String(user._id) === String(req.user._id)) {
    throw new BadRequestError("You cannot remove your own admin role");
  }

  if (role) user.role = role;
  if (plan) user.plan = plan;
  await user.save();

  return ok(res, { user: user.toPublicJSON() }, "User updated");
};
