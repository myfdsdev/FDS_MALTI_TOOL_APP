import type { GigPlatform } from "@/types/gigs";

export interface PlatformOption {
  value: GigPlatform;
  label: string;
  description: string;
  categoryPlaceholder: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  {
    value: "fiverr",
    label: "Fiverr",
    description: "Marketplace gigs with tiered packages.",
    categoryPlaceholder: "e.g. Graphics & Design > Logo Design",
  },
  {
    value: "upwork",
    label: "Upwork",
    description: "Project-based freelance proposals.",
    categoryPlaceholder: "e.g. Web, Mobile & Software Dev",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    description: "B2B service offering for your profile.",
    categoryPlaceholder: "e.g. Marketing & Communications",
  },
  {
    value: "instagram",
    label: "Instagram",
    description: "Creator/coach service in bio + reels.",
    categoryPlaceholder: "e.g. Coaching / Content / DM funnel",
  },
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Bidding-based contest & project listings.",
    categoryPlaceholder: "e.g. Websites, IT & Software",
  },
];

export const DELIVERY_TIME_OPTIONS = ["1 day", "2 days", "3 days", "5 days", "7 days", "14 days", "30 days"];

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD $" },
  { value: "INR", label: "INR ₹" },
  { value: "EUR", label: "EUR €" },
  { value: "GBP", label: "GBP £" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner", description: "Just starting / new portfolio" },
  { value: "intermediate", label: "Intermediate", description: "Some paid clients" },
  { value: "expert", label: "Expert", description: "Proven track record" },
] as const;

export const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Confident, clear, businesslike" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", description: "Conversion-focused copy" },
  { value: "casual", label: "Casual", description: "Relaxed, modern voice" },
] as const;
