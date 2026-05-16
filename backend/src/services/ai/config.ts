import { defaultModelFor, type AIProvider } from "../../config/ai.config.js";
import { env } from "../../config/env.js";
import type { UserDocument } from "../../models/User.model.js";
import type { ResolvedAIConfig } from "./providers.js";

export interface AISettingsResponse {
  aiProvider: AIProvider;
  aiModel: string;
  aiBaseUrl: string | null;
  hasApiKey: boolean;
  keyPreview: string | null;
  usingEnvFallback: boolean;
  envProvider: AIProvider | null;
  envModel: string | null;
  envBaseUrl: string | null;
}

function previewKey(apiKey?: string): string | null {
  return apiKey ? `...${apiKey.slice(-4)}` : null;
}

export function getAIConfigFromEnv(): ResolvedAIConfig | null {
  if (env.AI_API_KEY) {
    const provider = env.AI_PROVIDER || "openai";
    return {
      provider,
      apiKey: env.AI_API_KEY,
      model: env.AI_MODEL || defaultModelFor(provider),
      baseUrl: env.AI_BASE_URL || undefined,
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || env.AI_MODEL || defaultModelFor("openai"),
      baseUrl: env.OPENAI_BASE_URL || undefined,
    };
  }

  if (env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.ANTHROPIC_MODEL || env.AI_MODEL || defaultModelFor("anthropic"),
    };
  }

  const geminiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: env.GEMINI_MODEL || env.AI_MODEL || defaultModelFor("gemini"),
    };
  }

  return null;
}

export function resolveAIConfigForUser(user?: UserDocument | null): ResolvedAIConfig | null {
  const settings = user?.aiSettings;
  const apiKey = settings?.aiApiKey;

  if (apiKey) {
    const provider = settings.aiProvider || "anthropic";
    return {
      provider,
      apiKey,
      model: settings.aiModel || defaultModelFor(provider),
      baseUrl: settings.aiBaseUrl || undefined,
    };
  }

  return getAIConfigFromEnv();
}

export function toUserAISettingsResponse(user: UserDocument): AISettingsResponse {
  const provider = user.aiSettings?.aiProvider || "anthropic";
  const apiKey = user.aiSettings?.aiApiKey;
  const envFallback = getAIConfigFromEnv();

  return {
    aiProvider: provider,
    aiModel: user.aiSettings?.aiModel || defaultModelFor(provider),
    aiBaseUrl: user.aiSettings?.aiBaseUrl || null,
    hasApiKey: Boolean(apiKey),
    keyPreview: previewKey(apiKey),
    usingEnvFallback: !apiKey && Boolean(envFallback),
    envProvider: !apiKey ? envFallback?.provider ?? null : null,
    envModel: !apiKey ? envFallback?.model ?? null : null,
    envBaseUrl: !apiKey ? envFallback?.baseUrl ?? null : null,
  };
}
