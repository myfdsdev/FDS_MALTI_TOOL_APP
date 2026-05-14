export type ToolCategory =
  | "marketing"
  | "business"
  | "design"
  | "video"
  | "local"
  | "quick";

export type ToolInputType = "text" | "textarea" | "select" | "url";
export type ToolOutputKind = "text" | "list";

export interface ToolInput {
  key: string;
  label: string;
  type: ToolInputType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
}

export interface ToolOutputField {
  key: string;
  label: string;
  kind: ToolOutputKind;
  itemCount?: number;
}

export interface ToolPromptSpec {
  instructions: string[];
  outputFields: ToolOutputField[];
}

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: ToolInput[];
}

export interface ToolDefinition extends Tool {
  prompt: ToolPromptSpec;
}

export interface CategoryInfo {
  label: string;
  icon: string;
}
