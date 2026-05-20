import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "../../config/ai.config.js";

export interface ResolvedAIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ProviderGenerationResult {
  text: string;
  tokenCount?: number;
}

const anthropicClients = new Map<string, Anthropic>();
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_FETCH_ATTEMPTS = 3;

function anthropicClientFor(apiKey: string): Anthropic {
  let client = anthropicClients.get(apiKey);
  if (!client) {
    client = new Anthropic({ apiKey });
    anthropicClients.set(apiKey, client);
  }
  return client;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetries(
  label: string,
  url: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, init);
    if (response.ok) return response;

    const body = await response.text().catch(() => "");
    const bodyPreview = body ? `: ${body.slice(0, 300)}` : "";
    lastError = `${label} request failed with ${response.status}${bodyPreview}`;

    if (
      attempt === MAX_FETCH_ATTEMPTS ||
      !RETRYABLE_STATUS_CODES.has(response.status)
    ) {
      throw new Error(lastError);
    }

    await wait(750 * attempt);
  }

  throw new Error(lastError || `${label} request failed`);
}

export async function generateWithProvider(
  config: ResolvedAIConfig,
  system: string,
  user: string,
): Promise<ProviderGenerationResult> {
  switch (config.provider) {
    case "anthropic":
      return generateWithAnthropic(config, system, user);
    case "openai":
    case "openai-compatible":
      return generateWithOpenAICompatible(config, system, user);
    case "gemini":
      return generateWithGemini(config, system, user);
    default: {
      const exhaustiveCheck: never = config.provider;
      throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
    }
  }
}

async function generateWithAnthropic(
  config: ResolvedAIConfig,
  system: string,
  user: string,
): Promise<ProviderGenerationResult> {
  const response = await anthropicClientFor(config.apiKey).messages.create({
    model: config.model,
    max_tokens: 2500,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    text,
    tokenCount: response.usage.input_tokens + response.usage.output_tokens,
  };
}

async function generateWithOpenAICompatible(
  config: ResolvedAIConfig,
  system: string,
  user: string,
): Promise<ProviderGenerationResult> {
  const baseUrl = (config.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");

  const response = await fetchWithRetries("OpenAI-compatible", `${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    usage?: { total_tokens?: number };
  };

  const content = data.choices?.[0]?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) => part?.text || "")
            .join("\n")
            .trim()
        : "";

  return {
    text,
    tokenCount: data.usage?.total_tokens,
  };
}

async function generateWithGemini(
  config: ResolvedAIConfig,
  system: string,
  user: string,
): Promise<ProviderGenerationResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model,
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetchWithRetries("Gemini", endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: user }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    }),
  });

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
    usageMetadata?: { totalTokenCount?: number };
  };

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim() || "";

  return {
    text,
    tokenCount: data.usageMetadata?.totalTokenCount,
  };
}
