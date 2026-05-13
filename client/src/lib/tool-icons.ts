import type { LucideIcon } from "lucide-react";
import {
  Megaphone, Mail, MessageCircle, Sparkles, Hash, Film, Tag,
  Briefcase, FileText, Target, ListChecks,
  Palette, Type, BookOpen, Image as ImageIcon, LayoutTemplate, UserCircle2, PlaySquare,
  Video, Mic, Clapperboard,
  UtensilsCrossed, Dumbbell, Home, Scissors, Stethoscope, GraduationCap,
  Store, Wand2,
} from "lucide-react";
import type { ToolCategory } from "@/types/api";

const TOOL_ICONS: Record<string, LucideIcon> = {
  // marketing
  "hook-generator": Sparkles,
  "caption-generator": Hash,
  "email-writer": Mail,
  "whatsapp-writer": MessageCircle,
  "product-description": Tag,
  "reel-script": Film,
  // business
  "business-name": Briefcase,
  "logo-idea": Palette,
  "business-report": FileText,
  "offer-generator": Target,
  "meeting-summary": ListChecks,
  // design
  "color-palette": Palette,
  "font-pairing": Type,
  "brand-style-guide": BookOpen,
  "moodboard-prompt": ImageIcon,
  "website-section": LayoutTemplate,
  "portfolio-bio": UserCircle2,
  "thumbnail-idea": PlaySquare,
  "ad-banner-text": Megaphone,
  // video
  "faceless-video-idea": Video,
  "voiceover-script": Mic,
  "hook-script-cta": Clapperboard,
  // local
  "restaurant-promo": UtensilsCrossed,
  "gym-marketing": Dumbbell,
  "real-estate-listing": Home,
  "salon-offer": Scissors,
  "doctor-clinic-content": Stethoscope,
  "coaching-class-ad": GraduationCap,
};

const CATEGORY_ICONS: Record<ToolCategory, LucideIcon> = {
  marketing: Megaphone,
  business: Briefcase,
  design: Palette,
  video: Video,
  local: Store,
};

export function getToolIcon(toolId: string): LucideIcon {
  return TOOL_ICONS[toolId] ?? Wand2;
}

export function getCategoryIcon(category: ToolCategory): LucideIcon {
  return CATEGORY_ICONS[category] ?? Wand2;
}
