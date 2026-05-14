import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type {
  AdminStats,
  AdminUsersResponse,
  ApiSuccess,
  AuthPayload,
  HistoryResponse,
  PublicUser,
  SendVerificationResult,
  ToolsListResponse,
  UsageStatus,
} from "@/types/api";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const toolKeys = {
  list: ["tools", "list"] as const,
};

export const userKeys = {
  usage: ["user", "usage"] as const,
  history: (page: number, limit: number, toolId?: string) =>
    ["user", "history", { page, limit, toolId }] as const,
};

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: (params: AdminUsersParams) => ["admin", "users", params] as const,
};

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "user" | "admin";
  plan?: "free" | "pro" | "team";
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      setStatus("loading");
      try {
        const res = await api.get<ApiSuccess<{ user: PublicUser }>>("/auth/me");
        const user = res.data.data.user;
        setUser(user);
        return user;
      } catch (err) {
        setUser(null);
        throw err;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const res = await api.post<ApiSuccess<AuthPayload>>("/auth/login", vars);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      qc.setQueryData(authKeys.me, data.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (vars: { email: string; password: string; name: string }) => {
      const res = await api.post<ApiSuccess<AuthPayload>>("/auth/register", vars);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      qc.setQueryData(authKeys.me, data.user);
    },
  });
}

export function useGoogleLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (idToken: string) => {
      const res = await api.post<ApiSuccess<AuthPayload>>("/auth/google", { idToken });
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      qc.setQueryData(authKeys.me, data.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const reset = useAuthStore((s) => s.reset);

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => {
      reset();
      qc.clear();
    },
  });
}

export function useTools() {
  return useQuery({
    queryKey: toolKeys.list,
    queryFn: async () => {
      const res = await api.get<ApiSuccess<ToolsListResponse>>("/tools");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUsage() {
  const isAuthed = useAuthStore((s) => s.status === "authenticated");
  return useQuery({
    queryKey: userKeys.usage,
    queryFn: async () => {
      const res = await api.get<ApiSuccess<UsageStatus>>("/user/usage");
      return res.data.data;
    },
    enabled: isAuthed,
    staleTime: 30_000,
  });
}

export function useHistory(opts: { page?: number; limit?: number; toolId?: string } = {}) {
  const { page = 1, limit = 20, toolId } = opts;
  const isAuthed = useAuthStore((s) => s.status === "authenticated");
  return useQuery({
    queryKey: userKeys.history(page, limit, toolId),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<HistoryResponse>>("/user/history", {
        params: { page, limit, toolId },
      });
      return res.data.data;
    },
    enabled: isAuthed,
  });
}

export interface GenerateResult {
  toolId: string;
  toolName: string;
  output: unknown;
  mode?: string;
  durationMs?: number;
  generatedAt: string;
}

export function useGenerate(toolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: Record<string, string>) => {
      const res = await api.post<ApiSuccess<GenerateResult>>(
        `/tools/${toolId}/generate`,
        inputs,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.usage });
      qc.invalidateQueries({ queryKey: ["user", "history"] });
    },
  });
}

export function useDeleteHistoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/user/history/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "history"] });
    },
  });
}

/* ───── Email verification ──────────────────────────────── */

export function useSendVerification() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiSuccess<SendVerificationResult>>(
        "/auth/send-verification",
      );
      return res.data.data;
    },
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post<ApiSuccess<{ user: PublicUser }>>(
        "/auth/verify-email",
        { token },
      );
      return res.data.data.user;
    },
    onSuccess: (user) => {
      // If the verified account is the one currently signed in, refresh it.
      if (useAuthStore.getState().user?.id === user.id) {
        setUser(user);
        qc.setQueryData(authKeys.me, user);
      }
    },
  });
}

/* ───── Admin ───────────────────────────────────────────── */

export function useAdminStats() {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const res = await api.get<ApiSuccess<AdminStats>>("/admin/stats");
      return res.data.data;
    },
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminUsers(params: AdminUsersParams = {}) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async () => {
      const res = await api.get<ApiSuccess<AdminUsersResponse>>("/admin/users", {
        params,
      });
      return res.data.data;
    },
    enabled: isAdmin,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      role?: "user" | "admin";
      plan?: "free" | "pro" | "team";
    }) => {
      const { id, ...body } = vars;
      const res = await api.patch<ApiSuccess<{ user: PublicUser }>>(
        `/admin/users/${id}`,
        body,
      );
      return res.data.data.user;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
