import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    status: s.status,
    isAuthenticated: s.status === "authenticated",
    isLoading: s.status === "loading" || s.status === "idle",
  }));
}
