import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as gigsApi from "./gigs.api";
import type { ListGigsParams } from "./gigs.api";
import { scopeKey } from "@/lib/query-scope";
import { useAuthStore } from "@/stores/auth.store";
import type { Gig, GigInput, GigListItem, ImproveSection } from "@/types/gigs";

export const gigKeys = {
  all: (userId?: string | null) => ["gigs", scopeKey(userId)] as const,
  list: (userId: string | null | undefined, params?: ListGigsParams) =>
    [...gigKeys.all(userId), "list", params ?? {}] as const,
  detail: (userId: string | null | undefined, id: string) =>
    [...gigKeys.all(userId), "detail", id] as const,
  public: (slug: string) => ["publicGigs", slug] as const,
};

export function useGigs(params?: ListGigsParams) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: gigKeys.list(userId, params),
    queryFn: () => gigsApi.listGigs(params),
    enabled: Boolean(userId),
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = query.state.data as GigListItem[] | undefined;
      if (!Array.isArray(data)) return false;
      const hasActive = data.some((g) => g.status === "queued" || g.status === "processing");
      return hasActive ? 3000 : false;
    },
  });
}

export function useGig(id: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: id ? gigKeys.detail(userId, id) : [...gigKeys.all(userId), "detail", "none"],
    queryFn: () => gigsApi.getGig(id as string),
    enabled: Boolean(userId && id),
    refetchInterval: (query) => {
      const g = query.state.data as Gig | undefined;
      if (!g) return 2000;
      return g.status === "queued" || g.status === "processing" ? 2000 : false;
    },
  });
}

export function useCreateGig() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: GigInput) => gigsApi.createGig(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function usePatchGig(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (body: gigsApi.PatchGigBody) => gigsApi.patchGig(id, body),
    onSuccess: (gig) => {
      qc.setQueryData(gigKeys.detail(userId, id), gig);
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function useDeleteGig() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => gigsApi.deleteGig(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: gigKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function useRegenerateGig() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => gigsApi.regenerateGig(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: gigKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function useDuplicateGig() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => gigsApi.duplicateGig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function useImproveGigSection(id: string) {
  return useMutation({
    mutationFn: ({ section, instructions }: { section: ImproveSection; instructions?: string }) =>
      gigsApi.improveGigSection(id, section, instructions),
  });
}

export function useUpdateGigShare(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (enabled: boolean) => gigsApi.updateGigShare(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gigKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: gigKeys.all(userId) });
    },
  });
}

export function usePublicGig(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? gigKeys.public(slug) : ["publicGigs", "none"],
    queryFn: () => gigsApi.getPublicGig(slug as string),
    enabled: Boolean(slug),
  });
}
