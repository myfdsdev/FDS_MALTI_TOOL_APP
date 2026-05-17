import "dotenv/config";
import { z } from "zod";
import { AI_PROVIDERS } from "./ai.config.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  GOOGLE_CLIENT_ID: z.string().optional(),

  // Comma-separated list of emails auto-promoted to admin on register/login.
  ADMIN_EMAILS: z.string().default(""),

  // Single unified AI provider config. ONE key, ONE provider, ONE model.
  // Use AI_PROVIDER=openai-compatible + AI_BASE_URL for OpenRouter, Ollama, etc.
  AI_PROVIDER: z.enum(AI_PROVIDERS).optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_BASE_URL: z.string().url().optional(),

  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_API_MAX: z.coerce.number().default(60),
  RATE_LIMIT_API_WINDOW_MS: z.coerce.number().default(60 * 1000),

  FREE_PLAN_DAILY_LIMIT: z.coerce.number().default(20),
  FREE_PLAN_MONTHLY_LIMIT: z.coerce.number().default(200),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
