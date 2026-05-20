import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * AI-generated content is sometimes stored with literal escape sequences
 * (a backslash followed by "n" instead of a real newline). Convert those back
 * to real characters so multi-line text renders correctly.
 */
export function cleanText(value: string | null | undefined): string {
  return (value || "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t");
}
