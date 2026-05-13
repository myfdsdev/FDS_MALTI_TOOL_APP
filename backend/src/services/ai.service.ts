/**
 * AI Service — single integration point for all 28 tools.
 *
 * Currently in MOCK mode. When ready to wire up Claude or OpenAI,
 * replace the body of `generate()` — no other file needs to change.
 */

import { logger } from "../config/logger.js";

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

export const generate = async (params: GenerateParams): Promise<GenerateResult> => {
  const start = Date.now();
  const output = buildMockOutput(params);

  // Simulate small async delay so frontend can show loading state
  await new Promise((r) => setTimeout(r, 250));

  logger.debug({ toolId: params.toolId, mode: "mock" }, "Generation complete");

  return {
    output,
    mode: "mock",
    durationMs: Date.now() - start,
  };

  // ─── REAL AI MODE (later) ──────────────────────────────
  // const prompt = buildPrompt(params);
  // const response = await anthropic.messages.create({
  //   model: "claude-sonnet-4-5",
  //   max_tokens: 1024,
  //   messages: [{ role: "user", content: prompt }],
  // });
  // return { output: response.content, mode: "live", durationMs: ..., tokenCount: ... };
};

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
        }. Plug in a real AI provider in services/ai.service.ts to get live output.`,
      };
  }
}
