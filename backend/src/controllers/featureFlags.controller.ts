import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { UnauthorizedError } from "../utils/errors.js";
import {
  ALL_WORKSPACE_KEYS,
  getFeatureFlags,
  invalidateFeatureFlagsCache,
  type WorkspaceKey,
} from "../models/FeatureFlags.model.js";
import { TOOLS } from "../config/tools.config.js";
import type { UpdateFeatureFlagsInput } from "../validators/featureFlags.validator.js";

function serialize(doc: { disabledTools: string[]; disabledWorkspaces: WorkspaceKey[] }) {
  return {
    disabledTools: doc.disabledTools,
    disabledWorkspaces: doc.disabledWorkspaces,
    allWorkspaces: ALL_WORKSPACE_KEYS,
    allToolIds: TOOLS.map((t) => t.id),
  };
}

/** GET /api/feature-flags — public to authenticated users; returns current state. */
export const getPublicFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
  const flags = await getFeatureFlags();
  return ok(res, {
    disabledTools: flags.disabledTools,
    disabledWorkspaces: flags.disabledWorkspaces,
  });
});

/** GET /api/admin/feature-flags — admin view (includes full lists). */
export const adminGetFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
  const flags = await getFeatureFlags();
  return ok(
    res,
    serialize({
      disabledTools: flags.disabledTools,
      disabledWorkspaces: flags.disabledWorkspaces as WorkspaceKey[],
    })
  );
});

/** PATCH /api/admin/feature-flags */
export const adminUpdateFeatureFlags = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const input = req.body as UpdateFeatureFlagsInput;

  const flags = await getFeatureFlags();
  if (input.disabledTools !== undefined) {
    // Dedupe + keep only IDs that actually exist in the catalog.
    const known = new Set(TOOLS.map((t) => t.id));
    flags.disabledTools = Array.from(
      new Set(input.disabledTools.filter((id) => known.has(id)))
    );
  }
  if (input.disabledWorkspaces !== undefined) {
    const known = new Set<WorkspaceKey>(ALL_WORKSPACE_KEYS);
    const filtered = input.disabledWorkspaces.filter((k): k is WorkspaceKey =>
      known.has(k as WorkspaceKey)
    );
    flags.disabledWorkspaces = Array.from(new Set(filtered));
  }
  flags.updatedBy = req.user._id;
  await flags.save();
  invalidateFeatureFlagsCache();

  return ok(
    res,
    serialize({
      disabledTools: flags.disabledTools,
      disabledWorkspaces: flags.disabledWorkspaces as WorkspaceKey[],
    }),
    "Feature flags updated"
  );
});
