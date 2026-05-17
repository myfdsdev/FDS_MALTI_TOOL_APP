import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Global feature flags — a SINGLETON document. Admin can toggle which AI tools
 * and which workspaces are visible to all users on the site.
 *
 * Disabling a tool/workspace hides it in the UI AND blocks the corresponding
 * write endpoints on the backend.
 */

export type WorkspaceKey =
  | "ideas"
  | "projects"
  | "calendar"
  | "notes"
  | "link-saver"
  | "resumes"
  | "reports";

export const ALL_WORKSPACE_KEYS: WorkspaceKey[] = [
  "ideas",
  "projects",
  "calendar",
  "notes",
  "link-saver",
  "resumes",
  "reports",
];

export interface FeatureFlagsDocument extends Document {
  /** Tool IDs that are GLOBALLY hidden/blocked. */
  disabledTools: string[];
  /** Workspace keys that are GLOBALLY hidden/blocked. */
  disabledWorkspaces: WorkspaceKey[];
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagsSchema = new Schema<FeatureFlagsDocument>(
  {
    disabledTools: { type: [String], default: [] },
    disabledWorkspaces: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.every((v) => ALL_WORKSPACE_KEYS.includes(v as WorkspaceKey)),
        message: "Invalid workspace key",
      },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const FeatureFlags: Model<FeatureFlagsDocument> =
  mongoose.models.FeatureFlags ||
  mongoose.model<FeatureFlagsDocument>("FeatureFlags", featureFlagsSchema);

let cached: FeatureFlagsDocument | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 5_000;

/**
 * Get or create the singleton. Cached for 5s so high-traffic endpoints
 * don't hammer Mongo on every request — admin updates clear the cache.
 */
export async function getFeatureFlags(): Promise<FeatureFlagsDocument> {
  const now = Date.now();
  if (cached && now - cacheLoadedAt < CACHE_TTL_MS) return cached;

  const existing = await FeatureFlags.findOne();
  if (existing) {
    cached = existing;
    cacheLoadedAt = now;
    return existing;
  }
  const created = await FeatureFlags.create({});
  cached = created;
  cacheLoadedAt = now;
  return created;
}

export function invalidateFeatureFlagsCache(): void {
  cached = null;
  cacheLoadedAt = 0;
}

export interface ResolvedFeatureFlags {
  disabledTools: string[];
  disabledWorkspaces: WorkspaceKey[];
}

export async function loadResolvedFeatureFlags(): Promise<ResolvedFeatureFlags> {
  const doc = await getFeatureFlags();
  return {
    disabledTools: [...doc.disabledTools],
    disabledWorkspaces: [...doc.disabledWorkspaces] as WorkspaceKey[],
  };
}
