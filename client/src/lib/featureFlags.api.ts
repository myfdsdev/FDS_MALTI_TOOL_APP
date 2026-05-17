import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  AdminFeatureFlags,
  PublicFeatureFlags,
  WorkspaceKey,
} from "@/types/featureFlags";

export async function getFeatureFlags(): Promise<PublicFeatureFlags> {
  const response = await api.get<ApiSuccess<PublicFeatureFlags>>("/feature-flags");
  return response.data.data;
}

export async function adminGetFeatureFlags(): Promise<AdminFeatureFlags> {
  const response = await api.get<ApiSuccess<AdminFeatureFlags>>("/admin/feature-flags");
  return response.data.data;
}

export async function adminUpdateFeatureFlags(input: {
  disabledTools?: string[];
  disabledWorkspaces?: WorkspaceKey[];
}): Promise<AdminFeatureFlags> {
  const response = await api.patch<ApiSuccess<AdminFeatureFlags>>(
    "/admin/feature-flags",
    input
  );
  return response.data.data;
}
