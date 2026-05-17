import { z } from "zod";
import { ALL_WORKSPACE_KEYS } from "../models/FeatureFlags.model.js";

const workspaceEnum = z.enum(ALL_WORKSPACE_KEYS as [string, ...string[]]);

export const updateFeatureFlagsSchema = z
  .object({
    disabledTools: z.array(z.string().min(1).max(80)).max(500).optional(),
    disabledWorkspaces: z.array(workspaceEnum).max(50).optional(),
  })
  .refine(
    (value) => value.disabledTools !== undefined || value.disabledWorkspaces !== undefined,
    "At least one field is required"
  );

export type UpdateFeatureFlagsInput = z.infer<typeof updateFeatureFlagsSchema>;
