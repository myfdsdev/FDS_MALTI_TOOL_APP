import { logger } from "../config/logger.js";
import { getToolById } from "../config/tools.config.js";
import type { UserDocument } from "../models/User.model.js";
import { resolveAIConfigForUser } from "./ai/config.js";
import { buildSystemPrompt, buildUserPrompt } from "./ai/prompt-builder.js";
import { scrapeUrl } from "./linkPreview.service.js";
import { generateWithProvider, type ResolvedAIConfig } from "./ai/providers.js";

export type AIMode = "mock" | "live" | "scrape";

export interface GenerateParams {
  toolId: string;
  toolName: string;
  inputs: Record<string, unknown>;
  user?: UserDocument;
}

export interface GenerateResult {
  output: unknown;
  mode: AIMode;
  durationMs: number;
  tokenCount?: number;
}

export const generate = async (params: GenerateParams): Promise<GenerateResult> => {
  const start = Date.now();
  const tool = getToolById(params.toolId);

  if (params.toolId === "link-saver") {
    const url = typeof params.inputs.url === "string" ? params.inputs.url : "";
    const output = await scrapeUrl(url);
    return { output, mode: "scrape", durationMs: Date.now() - start };
  }

  const config = resolveAIConfigForUser(params.user);

  if (config && tool) {
    try {
      const result = await generateLive(config, tool, params.inputs);
      logger.debug(
        { toolId: params.toolId, provider: config.provider, mode: "live" },
        "Generation complete",
      );
      return { ...result, mode: "live", durationMs: Date.now() - start };
    } catch (err) {
      logger.error(
        { err, toolId: params.toolId, provider: config.provider },
        "AI generation failed; falling back to mock",
      );
    }
  }

  const output = buildMockOutput(params);
  await new Promise((resolve) => setTimeout(resolve, 250));
  logger.debug({ toolId: params.toolId, mode: "mock" }, "Generation complete");
  return { output, mode: "mock", durationMs: Date.now() - start };
};

async function generateLive(
  config: ResolvedAIConfig,
  tool: NonNullable<ReturnType<typeof getToolById>>,
  inputs: Record<string, unknown>,
): Promise<{ output: unknown; tokenCount?: number }> {
  const system = buildSystemPrompt(tool);
  const user = buildUserPrompt(tool, inputs);
  const response = await generateWithProvider(config, system, user);

  return {
    output: parseOutput(response.text),
    tokenCount: response.tokenCount,
  };
}

function parseOutput(raw: string): unknown {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) text = fenced[1].trim();

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // Fall back to a text block below.
  }

  return { text: raw.trim() };
}

function buildMockOutput({ toolId, toolName, inputs }: GenerateParams): unknown {
  const tool = getToolById(toolId);
  const inputSummary = Object.entries(inputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  if (!tool) {
    return {
      text: `Mock response for ${toolName}. Inputs: ${inputSummary || "(none)"}.`,
    };
  }

  return Object.fromEntries(
    tool.prompt.outputFields.map((field) => {
      if (field.kind === "list") {
        const count = field.itemCount || 5;
        return [
          field.key,
          Array.from({ length: count }, (_, index) => {
            const anchor = String(
              inputs.topic ||
                inputs.offer ||
                inputs.productName ||
                inputs.business ||
                inputs.brandName ||
                "your input",
            );
            return `${field.label} ${index + 1} for ${anchor}`;
          }),
        ];
      }

      return [
        field.key,
        `${field.label}\n\nMock output from ${toolName}. Inputs received: ${
          inputSummary || "(none)"
        }. Add a supported API key in your profile settings or environment for live output.`,
      ];
    }),
  );
}
