import type { Request, Response, NextFunction } from "express";
import { getFeatureFlags, type WorkspaceKey } from "../models/FeatureFlags.model.js";
import { ForbiddenError } from "../utils/errors.js";

/**
 * Block requests to a workspace when an admin has globally disabled it.
 * Admins are exempt so they can still manage data after disabling something.
 */
export function requireWorkspaceEnabled(workspace: WorkspaceKey) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === "admin") return next();
      const flags = await getFeatureFlags();
      if (flags.disabledWorkspaces.includes(workspace)) {
        throw new ForbiddenError(`The "${workspace}" workspace is disabled by the site admin`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Block tool generation when admin has disabled a specific tool.
 * Reads `toolId` from `req.params.toolId`.
 */
export async function requireToolEnabled(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.user?.role === "admin") return next();
    const toolId = req.params.toolId;
    if (!toolId) return next();
    const flags = await getFeatureFlags();
    if (flags.disabledTools.includes(toolId)) {
      throw new ForbiddenError(`The tool "${toolId}" is disabled by the site admin`);
    }
    next();
  } catch (err) {
    next(err);
  }
}
