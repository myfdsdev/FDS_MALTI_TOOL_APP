import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type {
  ApiSuccess,
  AuthPayload,
  HistoryResponse,
  PublicUser,
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
