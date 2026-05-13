/**
 * Central registry of all tools. Single source of truth.
 * Both the API and frontend pull from this list.
 */

export type ToolCategory = "marketing" | "business" | "design" | "video" | "local";

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  inputs: string[];
}

export interface CategoryInfo {
  label: string;
  icon: string;
}

export const TOOLS: Tool[] = [
  // ─── Marketing / Creator Tools ───────────────────────────
  { id: "hook-generator", name: "AI Social Hook Generator", category: "marketing", description: "Enter a topic and get viral hooks for reels and posts.", inputs: ["topic", "platform"] },
  { id: "caption-generator", name: "AI Caption Generator", category: "marketing", description: "Generate Instagram, LinkedIn, and Facebook captions.", inputs: ["topic", "platform", "tone"] },
  { id: "email-writer", name: "AI Email Writer", category: "marketing", description: "Enter purpose and tone, get a ready-to-send email.", inputs: ["purpose", "tone", "recipient"] },
  { id: "whatsapp-writer", name: "AI WhatsApp Message Writer", category: "marketing", description: "Sales messages, follow-ups, and client replies.", inputs: ["messageType", "context"] },
  { id: "product-description", name: "AI Product Description Writer", category: "marketing", description: "Write compelling e-commerce product descriptions.", inputs: ["productName", "features", "audience"] },
  { id: "reel-script", name: "AI Reel Script Generator", category: "marketing", description: "15s, 30s, and 60s reel scripts from a product or topic.", inputs: ["topic", "duration"] },

  // ─── Business Tools ──────────────────────────────────────
  { id: "business-name", name: "AI Business Name Generator", category: "business", description: "Enter your niche and get brand name ideas.", inputs: ["niche", "style"] },
  { id: "logo-idea", name: "AI Logo Idea Generator", category: "business", description: "Logo concepts: colours, style, and typography (not images).", inputs: ["brandName", "industry"] },
  { id: "business-report", name: "AI Business Report Generator", category: "business", description: "Enter business details or URL to get a growth report.", inputs: ["businessName", "url", "industry"] },
  { id: "offer-generator", name: "AI Offer Generator", category: "business", description: "Enter your business and get offer ideas.", inputs: ["business", "goal"] },
  { id: "meeting-summary", name: "AI Meeting Summary Generator", category: "business", description: "Paste meeting notes, get a summary plus action points.", inputs: ["notes"] },

  // ─── Design / Branding Tools ─────────────────────────────
  { id: "color-palette", name: "AI Color Palette Generator", category: "design", description: "Brand type to colors with hex codes.", inputs: ["brandType", "mood"] },
  { id: "font-pairing", name: "AI Font Pairing Generator", category: "design", description: "Suggests heading and body font pairs.", inputs: ["style", "industry"] },
  { id: "brand-style-guide", name: "AI Brand Style Guide Generator", category: "design", description: "Logo style, colors, tone, audience, social style.", inputs: ["brandName", "industry", "audience"] },
  { id: "moodboard-prompt", name: "AI Moodboard Prompt Generator", category: "design", description: "Creates prompts for brand moodboards.", inputs: ["brandType", "vibe"] },
  { id: "website-section", name: "AI Website Section Generator", category: "design", description: "Hero, features, pricing, and FAQ sections.", inputs: ["sectionType", "business"] },
  { id: "portfolio-bio", name: "AI Portfolio Bio Generator", category: "design", description: "For freelancers, designers, and creators.", inputs: ["profession", "experience", "tone"] },
  { id: "thumbnail-idea", name: "AI YouTube Thumbnail Idea Generator", category: "design", description: "Thumbnail concept, text, pose, and colors.", inputs: ["videoTopic", "style"] },
  { id: "ad-banner-text", name: "AI Ad Banner Text Generator", category: "design", description: "Generates short, punchy banner copy.", inputs: ["product", "offer"] },

  // ─── Video / AI Prompt Tools ─────────────────────────────
  { id: "faceless-video-idea", name: "AI Faceless Video Idea Generator", category: "video", description: "Topic to 10 faceless video ideas.", inputs: ["topic", "niche"] },
  { id: "voiceover-script", name: "AI Voiceover Script Generator", category: "video", description: "Voiceover scripts for ads, reels, and videos.", inputs: ["topic", "duration", "tone"] },
  { id: "hook-script-cta", name: "AI Hook + Script + CTA Generator", category: "video", description: "Complete short-form video package.", inputs: ["topic", "platform"] },

  // ─── Local Business Tools ────────────────────────────────
  { id: "restaurant-promo", name: "AI Restaurant Promo Generator", category: "local", description: "Menu and business details to promo captions, reels, offers.", inputs: ["restaurantName", "cuisine", "specialty"] },
  { id: "gym-marketing", name: "AI Gym Marketing Generator", category: "local", description: "Gym ads, reels, and WhatsApp campaigns.", inputs: ["gymName", "service", "offer"] },
  { id: "real-estate-listing", name: "AI Real Estate Listing Writer", category: "local", description: "Property details to listing description and ad copy.", inputs: ["propertyType", "location", "features"] },
  { id: "salon-offer", name: "AI Salon Offer Generator", category: "local", description: "Beauty and salon package offers.", inputs: ["salonName", "services"] },
  { id: "doctor-clinic-content", name: "AI Doctor Clinic Content Generator", category: "local", description: "Educational posts, appointment CTAs, service copy.", inputs: ["specialty", "contentType"] },
  { id: "coaching-class-ad", name: "AI Coaching Class Ad Generator", category: "local", description: "Ads for tutors and coaching institutes.", inputs: ["subject", "audience", "offer"] },
];

export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  marketing: { label: "Marketing & Creator", icon: "megaphone" },
  business: { label: "Business", icon: "briefcase" },
  design: { label: "Design & Branding", icon: "palette" },
  video: { label: "Video & AI Prompts", icon: "video" },
  local: { label: "Local Business", icon: "store" },
};

export const getToolById = (id: string): Tool | undefined => TOOLS.find((t) => t.id === id);
export const getToolsByCategory = (cat: ToolCategory): Tool[] => TOOLS.filter((t) => t.category === cat);
