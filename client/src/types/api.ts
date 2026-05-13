export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "local" | "google";
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthPayload {
  user: PublicUser;
  accessToken?: string;
}

export type ToolCategory = "marketing" | "business" | "design" | "video" | "local";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: string[];
}

export interface CategoryInfo {
  label: string;
  icon: string;
}

export interface ToolsListResponse {
  categories: Record<ToolCategory, CategoryInfo>;
  tools: Tool[];
}

export type Plan = "free" | "pro" | "team";

export interface UsageStatus {
  plan: Plan;
  daily: { used: number; limit: number; remaining: number };
  monthly: { used: number; limit: number; remaining: number };
  total: number;
}

export interface Generation {
  _id: string;
  user: string;
  toolId: string;
  toolName?: string;
  inputs: Record<string, unknown>;
  output: unknown;
  status: "active" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface HistoryResponse {
  items: Generation[];
  pagination: Pagination;
}
