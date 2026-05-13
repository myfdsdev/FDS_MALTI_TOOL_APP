import type { Request, Response } from "express";
import { Generation } from "../models/Generation.model.js";
import { getUsageStatus } from "../services/usage.service.js";
import { ok } from "../utils/responses.js";
import { UnauthorizedError, NotFoundError } from "../utils/errors.js";

/** GET /api/user/usage */
export const getMyUsage = (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  return ok(res, getUsageStatus(req.user));
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
