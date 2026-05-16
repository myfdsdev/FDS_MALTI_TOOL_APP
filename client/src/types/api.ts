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

export type UserRole = "user" | "admin";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "local" | "google";
  role: UserRole;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthPayload {
  user: PublicUser;
  accessToken?: string;
}

export type ToolCategory =
  | "marketing"
  | "business"
  | "design"
  | "video"
  | "local"
  | "quick";

export type ToolInputType = "text" | "textarea" | "select" | "url";

export interface ToolInput {
  key: string;
  label: string;
  type: ToolInputType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: ToolInput[];
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

export type AiProvider =
  | "anthropic"
  | "openai"
  | "gemini"
  | "openai-compatible";

export type AiModel = string;

export interface UserAISettings {
  aiProvider: AiProvider;
  aiModel: AiModel;
  aiBaseUrl: string | null;
  hasApiKey: boolean;
  keyPreview: string | null;
  usingEnvFallback: boolean;
  envProvider: AiProvider | null;
  envModel: string | null;
  envBaseUrl: string | null;
}

export interface UpdateUserAISettingsInput {
  aiProvider?: AiProvider;
  aiApiKey?: string;
  aiModel?: AiModel;
  aiBaseUrl?: string;
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

/* ───── Email verification ──────────────────────────────── */

export interface SendVerificationResult {
  sent: boolean;
  /** Only present outside production — no real mailer is wired up. */
  verificationUrl?: string;
}

/* ───── Admin ───────────────────────────────────────────── */

export interface AdminStats {
  users: {
    total: number;
    verified: number;
    admins: number;
    byPlan: Record<Plan, number>;
  };
  generations: {
    total: number;
    today: number;
  };
  topTools: { toolId: string; toolName: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "local" | "google";
  role: UserRole;
  emailVerified: boolean;
  plan: Plan;
  totalGenerations: number;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  pagination: Pagination;
}

export interface AdminSettings {
  aiProvider: AiProvider;
  aiModel: AiModel;
  aiBaseUrl: string | null;
  hasApiKey: boolean;
  keyPreview: string | null;
  usingEnvFallback: boolean;
  envProvider: AiProvider | null;
  envModel: string | null;
  envBaseUrl: string | null;
}
