/**
 * AI Service — single integration point for all tools.
 *
 * When ANTHROPIC_API_KEY is set, generation runs against the real Claude API.
 * Otherwise it falls back to mock output so the app still works in dev.
 */

import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { getToolById } from "../config/tools.config.js";

export type AIMode = "mock" | "live";

export interface GenerateParams {
  toolId: string;
  toolName: string;
  inputs: Record<string, unknown>;
}

export interface GenerateResult {
  output: unknown;
  mode: AIMode;
  durationMs: number;
  tokenCount?: number;
}

const MODEL = "claude-sonnet-4-6";

// Static, cacheable system prompt — describes the JSON output contract.
const SYSTEM_PROMPT = `You are the content-generation engine behind a suite of marketing, business, design, and creator tools. You receive a tool and its inputs, and produce high-quality, ready-to-use output.

Reply with ONLY a single JSON object — no prose, no markdown code fences. Choose the shape that best fits the tool:
- A list of short lines (hooks, captions, ideas, blog titles): {"hooks": string[]}
- Name / handle / title ideas: {"names": string[]}
- A color palette: {"palette": [{"name": string, "hex": string}]}
- A font pairing: {"heading": string, "body": string, "notes": string}
- A summary with action points: {"summary": string, "actionItems": string[]}
- Anything else (emails, scripts, ad copy, bios, calendars, AI prompts, proposals): {"text": string} where "text" is well-formatted Markdown.

Keep output concise, specific, and immediately usable. Aim for 5–8 items in any list.`;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

export const generate = async (params: GenerateParams): Promise<GenerateResult> => {
  const start = Date.now();
  const anthropic = getClient();

  if (anthropic) {
    try {
      const result = await generateWithClaude(anthropic, params);
      logger.debug({ toolId: params.toolId, mode: "live" }, "Generation complete");
      return { ...result, mode: "live", durationMs: Date.now() - start };
    } catch (err) {
      logger.error({ err, toolId: params.toolId }, "Claude generation failed — falling back to mock");
    }
  }

  // Mock fallback (no key, or live call failed).
  const output = buildMockOutput(params);
  await new Promise((r) => setTimeout(r, 250));
  logger.debug({ toolId: params.toolId, mode: "mock" }, "Generation complete");
  return { output, mode: "mock", durationMs: Date.now() - start };
};

async function generateWithClaude(
  anthropic: Anthropic,
  { toolId, toolName, inputs }: GenerateParams,
): Promise<{ output: unknown; tokenCount?: number }> {
  const description = getToolById(toolId)?.description;
  const inputLines = Object.entries(inputs)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const userMessage = [
    `Tool: ${toolName}`,
    description ? `Purpose: ${description}` : null,
    "",
    "Inputs:",
    inputLines || "(none)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    output: parseOutput(text),
    tokenCount: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/** Parse the model's reply into a structured object; fall back to a text block. */
function parseOutput(raw: string): unknown {
  let s = raw.trim();
  const fenced = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) s = fenced[1].trim();
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // not JSON — fall through
  }
  return { text: raw.trim() };
}

function buildMockOutput({ toolId, toolName, inputs }: GenerateParams): unknown {
  const inputSummary = Object.entries(inputs)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  switch (toolId) {
    case "hook-generator":
      return {
        hooks: [
          `POV: You just discovered ${inputs.topic || "this"} and your life changed`,
          `Nobody is talking about ${inputs.topic || "this"} — and they should be`,
          `I tried ${inputs.topic || "this"} for 7 days. Here's what happened.`,
          `The ${inputs.topic || "thing"} mistake 90% of people make`,
          `Stop scrolling if you care about ${inputs.topic || "this"}`,
        ],
      };

    case "color-palette":
      return {
        palette: [
          { name: "Primary", hex: "#2563EB" },
          { name: "Accent", hex: "#F59E0B" },
          { name: "Background", hex: "#F8FAFC" },
          { name: "Text", hex: "#0F172A" },
          { name: "Muted", hex: "#64748B" },
        ],
      };

    case "business-name":
      return {
        names: ["Northwind", "BrightForge", "Verve Studio", "Kinetic Co.", "Lumenly"],
      };

    case "font-pairing":
      return {
        heading: "Inter",
        body: "Source Serif Pro",
        notes: "Modern, readable, works well for tech and creator brands.",
      };

    case "meeting-summary":
      return {
        summary: `Mock summary for the notes you provided. Inputs: ${inputSummary}`,
        actionItems: [
          "Follow up with stakeholders by Friday",
          "Draft proposal v2",
          "Schedule design review",
        ],
      };

    default:
      return {
        text: `This is a mock response from ${toolName}. Inputs received → ${
          inputSummary || "(none)"
        }. Set ANTHROPIC_API_KEY in the backend .env to get live AI output.`,
      };
  }
}
