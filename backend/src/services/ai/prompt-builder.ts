import type { ToolDefinition, ToolOutputField } from "../../config/tools.config.js";

function outputFieldInstruction(field: ToolOutputField): string {
  if (field.kind === "list") {
    const count = field.itemCount ? ` with exactly ${field.itemCount} items` : "";
    return `- ${field.key}: array of strings${count}. Label: ${field.label}.`;
  }

  return `- ${field.key}: string. Label: ${field.label}.`;
}

export function buildSystemPrompt(tool: ToolDefinition): string {
  const outputRules = tool.prompt.outputFields.map(outputFieldInstruction).join("\n");
  const toolRules = tool.prompt.instructions.map((rule) => `- ${rule}`).join("\n");

  return [
    "You are the content engine for a suite of business, marketing, design, and creator tools.",
    `You are generating output for the tool "${tool.name}".`,
    "Return ONLY valid JSON.",
    "Do not use markdown code fences.",
    "Do not add any commentary before or after the JSON.",
    "Use exactly the keys listed below and do not add extra top-level keys.",
    "",
    "Output contract:",
    outputRules,
    "",
    "Tool rules:",
    toolRules,
    "",
    "Quality bar:",
    "- Make the output specific, commercially useful, and ready to use.",
    "- Match the tone, audience, platform, and context from the inputs.",
    "- If an input is missing, make a reasonable assumption and keep it neutral.",
  ].join("\n");
}

export function buildUserPrompt(
  tool: ToolDefinition,
  inputs: Record<string, unknown>,
): string {
  const inputLines = tool.inputs
    .map((input) => {
      const value = inputs[input.key];
      const rendered =
        value === undefined || value === null || String(value).trim() === ""
          ? "(not provided)"
          : String(value).trim();
      return `- ${input.label}: ${rendered}`;
    })
    .join("\n");

  return [
    `Tool: ${tool.name}`,
    `Purpose: ${tool.description}`,
    "",
    "User inputs:",
    inputLines,
  ].join("\n");
}
