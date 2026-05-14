import type { ToolInput, ToolOutputField } from "./types.js";

const DEFAULT_REQUIRED = true;

export const GENERAL_TONES = [
  "Professional",
  "Friendly",
  "Confident",
  "Casual",
  "Bold",
  "Playful",
  "Luxury",
];

export const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "X / Twitter",
];

export const SHORT_FORM_PLATFORMS = [
  "Instagram Reels",
  "TikTok",
  "YouTube Shorts",
  "Facebook Reels",
];

export const AD_PLATFORMS = [
  "Facebook",
  "Instagram",
  "Google",
  "YouTube",
  "LinkedIn",
];

export function textInput(
  key: string,
  label: string,
  placeholder: string,
  overrides: Partial<ToolInput> = {},
): ToolInput {
  return {
    key,
    label,
    type: "text",
    placeholder,
    required: DEFAULT_REQUIRED,
    ...overrides,
  };
}

export function textareaInput(
  key: string,
  label: string,
  placeholder: string,
  overrides: Partial<ToolInput> = {},
): ToolInput {
  return {
    key,
    label,
    type: "textarea",
    placeholder,
    required: DEFAULT_REQUIRED,
    ...overrides,
  };
}

export function selectInput(
  key: string,
  label: string,
  options: string[],
  placeholder?: string,
  overrides: Partial<ToolInput> = {},
): ToolInput {
  return {
    key,
    label,
    type: "select",
    options,
    placeholder,
    required: DEFAULT_REQUIRED,
    ...overrides,
  };
}

export function urlInput(
  key: string,
  label: string,
  placeholder: string,
  overrides: Partial<ToolInput> = {},
): ToolInput {
  return {
    key,
    label,
    type: "url",
    placeholder,
    required: DEFAULT_REQUIRED,
    ...overrides,
  };
}

export function textOutput(key: string, label: string): ToolOutputField {
  return { key, label, kind: "text" };
}

export function listOutput(
  key: string,
  label: string,
  itemCount?: number,
): ToolOutputField {
  return { key, label, kind: "list", itemCount };
}
