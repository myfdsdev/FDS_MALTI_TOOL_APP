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

function configFromSingleApiKey(apiKey: string): ResolvedAIConfig {
  const trimmedKey = apiKey.trim();

  if (trimmedKey.startsWith("AIza")) {
    const provider: AIProvider = "gemini";
    return {
      provider,
      apiKey: trimmedKey,
      model: defaultModelFor(provider),
    };
  }

  if (trimmedKey.startsWith("sk-ant-")) {
    const provider: AIProvider = "anthropic";
    return {
      provider,
      apiKey: trimmedKey,
      model: defaultModelFor(provider),
    };
  }

  if (trimmedKey.startsWith("sk-or-v1-")) {
    return {
      provider: "openai-compatible",
      apiKey: trimmedKey,
      model: "openai/gpt-4.1-mini",
      baseUrl: "https://openrouter.ai/api/v1",
    };
  }

  if (trimmedKey.startsWith("gsk_")) {
    return {
      provider: "openai-compatible",
      apiKey: trimmedKey,
      model: "llama-3.1-8b-instant",
      baseUrl: "https://api.groq.com/openai/v1",
    };
  }

  const provider: AIProvider = "openai-compatible";
  return {
    provider,
    apiKey: trimmedKey,
    model: defaultModelFor(provider),
  };
}

/**
 * Env fallback intentionally accepts only one variable: AI_API_KEY.
 * Provider/model/base URL stay as app defaults.
 */
export function getAIConfigFromEnv(): ResolvedAIConfig | null {
  if (!env.AI_API_KEY) return null;
  return configFromSingleApiKey(env.AI_API_KEY);
}

export function resolveAIConfigForUser(user?: UserDocument | null): ResolvedAIConfig | null {
  const settings = user?.aiSettings;
  const apiKey = settings?.aiApiKey;

  if (apiKey) {
    if ((!settings?.aiProvider || settings.aiProvider === "openai-compatible") && !settings?.aiBaseUrl) {
      return configFromSingleApiKey(apiKey);
    }

    const provider = settings.aiProvider || "openai-compatible";
    return {
      provider,
      apiKey: apiKey.trim(),
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
