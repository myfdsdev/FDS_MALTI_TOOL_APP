import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetFeatureFlags,
  adminUpdateFeatureFlags,
  getFeatureFlags,
} from "@/lib/featureFlags.api";
import { useAuthStore } from "@/stores/auth.store";
import type {
  AdminFeatureFlags,
  PublicFeatureFlags,
  WorkspaceKey,
} from "@/types/featureFlags";

const PUBLIC_KEY = ["feature-flags"] as const;
const ADMIN_KEY = ["admin", "feature-flags"] as const;

const EMPTY: PublicFeatureFlags = { disabledTools: [], disabledWorkspaces: [] };

/**
 * Reads the global feature-flag state and exposes simple helper checks.
 * Used by every page that needs to hide/show tools or workspaces.
 *
 * Admins always see everything — the hook returns `false` for the disabled
 * checks when the user is an admin, so admin UI is never accidentally hidden.
 */
export function useFeatureFlags() {
  const userId = useAuthStore((s) => s.user?.id);
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  const query = useQuery({
    queryKey: PUBLIC_KEY,
    queryFn: getFeatureFlags,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  return useMemo(() => {
    const flags = query.data ?? EMPTY;
    return {
      isLoading: query.isLoading,
      flags,
      isToolDisabled: (toolId: string) =>
        !isAdmin && flags.disabledTools.includes(toolId),
      isWorkspaceDisabled: (key: WorkspaceKey) =>
        !isAdmin && flags.disabledWorkspaces.includes(key),
      isAnyWorkspaceEnabled: (keys: WorkspaceKey[]) =>
        isAdmin || keys.some((k) => !flags.disabledWorkspaces.includes(k)),
    };
  }, [query.data, query.isLoading, isAdmin]);
}

export function useAdminFeatureFlags() {
  return useQuery<AdminFeatureFlags>({
    queryKey: ADMIN_KEY,
    queryFn: adminGetFeatureFlags,
    staleTime: 5_000,
  });
}

export function useUpdateFeatureFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      disabledTools?: string[];
      disabledWorkspaces?: WorkspaceKey[];
    }) => adminUpdateFeatureFlags(input),
    onSuccess: (data) => {
      qc.setQueryData(ADMIN_KEY, data);
      qc.setQueryData<PublicFeatureFlags>(PUBLIC_KEY, {
        disabledTools: data.disabledTools,
        disabledWorkspaces: data.disabledWorkspaces,
      });
    },
  });
}
