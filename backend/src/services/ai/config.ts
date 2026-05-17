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

/**
 * Single unified env-based AI config. One provider, one key, one model, one
 * base URL. Use `AI_PROVIDER=openai-compatible` and `AI_BASE_URL=<endpoint>`
 * for OpenRouter, Ollama, or any OpenAI-compatible API.
 */
export function getAIConfigFromEnv(): ResolvedAIConfig | null {
  if (!env.AI_API_KEY) return null;
  const provider = env.AI_PROVIDER || "openai-compatible";
  return {
    provider,
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL || defaultModelFor(provider),
    baseUrl: env.AI_BASE_URL || undefined,
  };
}

export function resolveAIConfigForUser(user?: UserDocument | null): ResolvedAIConfig | null {
  const settings = user?.aiSettings;
  const apiKey = settings?.aiApiKey;

  if (apiKey) {
    const provider = settings.aiProvider || "openai-compatible";
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
  const provider = user.aiSettings?.aiProvider || "openai-compatible";
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
