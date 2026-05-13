import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<void> | null = null;

async function performRefresh(): Promise<void> {
  if (refreshing) return refreshing;
  refreshing = axios
    .post(
      `${api.defaults.baseURL}/auth/refresh`,
      null,
      { withCredentials: true },
    )
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(fn: () => void) {
  onAuthFailure = fn;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh/login/logout endpoints themselves.
    const url = original.url ?? "";
    if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/logout") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (original._retry) {
      onAuthFailure?.();
      return Promise.reject(error);
    }

    try {
      original._retry = true;
      await performRefresh();
      return api(original);
    } catch (e) {
      onAuthFailure?.();
      return Promise.reject(e);
    }
  },
);

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
