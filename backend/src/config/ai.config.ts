export const AI_PROVIDERS = [
  "anthropic",
  "openai",
  "gemini",
  "openai-compatible",
] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-4.1-mini",
  gemini: "gemini-2.5-flash",
  "openai-compatible": "gpt-4.1-mini",
};

export function defaultModelFor(provider: AIProvider): string {
  return DEFAULT_AI_MODELS[provider];
}
