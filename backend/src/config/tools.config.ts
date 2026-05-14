import { businessTools } from "./tools/business.js";
import { designTools } from "./tools/design.js";
import { localBusinessTools } from "./tools/local.js";
import { marketingTools } from "./tools/marketing.js";
import { quickTools } from "./tools/quick.js";
import type {
  CategoryInfo,
  Tool,
  ToolCategory,
  ToolDefinition,
  ToolInput,
  ToolOutputField,
  ToolOutputKind,
  ToolPromptSpec,
} from "./tools/types.js";
import { videoTools } from "./tools/video.js";

export type {
  CategoryInfo,
  Tool,
  ToolCategory,
  ToolDefinition,
  ToolInput,
  ToolOutputField,
  ToolOutputKind,
  ToolPromptSpec,
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  ...marketingTools,
  ...businessTools,
  ...designTools,
  ...videoTools,
  ...localBusinessTools,
  ...quickTools,
];

export const TOOLS: Tool[] = TOOL_DEFINITIONS.map(({ prompt: _prompt, ...tool }) => tool);

export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  marketing: { label: "Marketing & Creator", icon: "megaphone" },
  business: { label: "Business", icon: "briefcase" },
  design: { label: "Design & Branding", icon: "palette" },
  video: { label: "Video & AI Prompts", icon: "video" },
  local: { label: "Local Business", icon: "store" },
  quick: { label: "Quick Tools", icon: "zap" },
};

export const getToolById = (id: string): ToolDefinition | undefined =>
  TOOL_DEFINITIONS.find((tool) => tool.id === id);

export const getToolsByCategory = (category: ToolCategory): Tool[] =>
  TOOLS.filter((tool) => tool.category === category);
