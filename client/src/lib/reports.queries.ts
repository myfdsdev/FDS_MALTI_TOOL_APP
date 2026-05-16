import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as reportsApi from "./reports.api";
import { scopeKey } from "@/lib/query-scope";
import { useAuthStore } from "@/stores/auth.store";
import type { Report, ReportStatus } from "@/types/reports";

export const reportKeys = {
  all: (userId?: string | null) => ["reports", scopeKey(userId)] as const,
  list: (userId: string | null | undefined, status?: ReportStatus) =>
    [...reportKeys.all(userId), "list", { status }] as const,
  detail: (userId: string | null | undefined, id: string) =>
    [...reportKeys.all(userId), "detail", id] as const,
  public: (slug: string) => ["publicReports", slug] as const,
};

export function useReports(status?: ReportStatus) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: reportKeys.list(userId, status),
    queryFn: () => reportsApi.listReports(status),
    enabled: Boolean(userId),
    staleTime: 10_000,
    refetchInterval: (query) => {
      const data = query.state.data as ReturnType<typeof reportsApi.listReports> extends Promise<infer T> ? T : never;
      if (!Array.isArray(data)) return false;
      const hasActive = data.some((r) => r.status === "queued" || r.status === "processing");
      return hasActive ? 3000 : false;
    },
  });
}

export function useReport(id: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: id ? reportKeys.detail(userId, id) : [...reportKeys.all(userId), "detail", "none"],
    queryFn: () => reportsApi.getReport(id as string),
    enabled: Boolean(userId && id),
    refetchInterval: (query) => {
      const r = query.state.data as Report | undefined;
      if (!r) return 2000;
      return r.status === "completed" || r.status === "failed" ? false : 2000;
    },
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (url: string) => reportsApi.createReport(url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportKeys.all(userId) });
    },
  });
}

export function useRetryReport() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => reportsApi.retryReport(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: reportKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: reportKeys.all(userId) });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => reportsApi.deleteReport(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: reportKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: reportKeys.all(userId) });
    },
  });
}

export function useUpdateReportShare(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (enabled: boolean) => reportsApi.updateShare(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: reportKeys.all(userId) });
    },
  });
}

export function usePublicReport(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? reportKeys.public(slug) : ["reports", "public", "none"],
    queryFn: () => reportsApi.getPublicReport(slug as string),
    enabled: Boolean(slug),
  });
}
