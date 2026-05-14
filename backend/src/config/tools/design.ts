import type { ToolDefinition } from "./types.js";
import { GENERAL_TONES, listOutput, selectInput, textInput, textOutput, textareaInput } from "./shared.js";

export const designTools: ToolDefinition[] = [
  {
    id: "color-palette",
    name: "AI Colour Palette Generator",
    category: "design",
    description: "Create brand colour palettes with hex codes and a job for each colour.",
    inputs: [
      textInput("brandType", "Brand Type", "SaaS, beauty clinic, restaurant, personal brand"),
      textInput("audience", "Audience", "Luxury buyers, Gen Z creators, B2B teams"),
      textInput("vibe", "Vibe", "Premium, playful, calm, editorial"),
      textInput("colorDirection", "Color Direction", "Warm neutrals with a sharp accent", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Include hex codes and explain the purpose of each colour.",
        "Keep the palette coherent and usable across web and social.",
        "Avoid palettes that feel muddy or hard to read.",
      ],
      outputFields: [
        textOutput("primaryColour", "Primary Colour"),
        textOutput("secondaryColour", "Secondary Colour"),
        textOutput("accentColor", "Accent Color"),
        textOutput("backgroundColor", "Background Color"),
        textOutput("textColor", "Text Color"),
      ],
    },
  },
  {
    id: "font-pairing",
    name: "AI Font Pairing Generator",
    category: "design",
    description: "Suggest font pairs for headings, body copy, and accents.",
    inputs: [
      textInput("brandType", "Brand Type", "Luxury skincare, startup SaaS, local gym"),
      textInput("style", "Style", "Modern, elegant, editorial, approachable"),
      textInput("usage", "Usage", "Website, logo system, ad creative, product packaging"),
    ],
    prompt: {
      instructions: [
        "Explain which font works best for heading, body, and accent use.",
        "Make each pairing distinct in feel.",
        "Prefer accessible, realistic pairings rather than obscure choices.",
      ],
      outputFields: [
        textOutput("fontPairing1", "Font Pairing 1"),
        textOutput("fontPairing2", "Font Pairing 2"),
        textOutput("fontPairing3", "Font Pairing 3"),
      ],
    },
  },
  {
    id: "brand-style-guide",
    name: "AI Brand Style Guide Generator",
    category: "design",
    description: "Build a compact style guide covering tone, typography, colour, and image direction.",
    inputs: [
      textInput("brandName", "Brand Name", "Luma Clinic"),
      textInput("industry", "Industry", "Healthcare, ecommerce, agency, creator"),
      textInput("audience", "Audience", "Busy parents, premium shoppers, founders"),
      textInput("brandPersonality", "Brand Personality", "Warm, precise, elevated"),
    ],
    prompt: {
      instructions: [
        "Create a mini style guide that feels usable by a real team.",
        "Make the brand personality and design direction consistent with the audience.",
        "Keep the guidance specific rather than generic.",
      ],
      outputFields: [
        textOutput("brandPersonality", "Brand Personality"),
        textOutput("colorDirection", "Color Direction"),
        textOutput("typography", "Typography"),
        textOutput("toneOfVoice", "Tone of Voice"),
        textOutput("imageStyle", "Image Style"),
        textOutput("designRules", "Design Rules"),
      ],
    },
  },
  {
    id: "moodboard-prompt",
    name: "AI Moodboard Prompt Generator",
    category: "design",
    description: "Generate a detailed prompt for creating a brand moodboard.",
    inputs: [
      textInput("brandType", "Brand Type", "Wellness studio, fashion label, fintech app"),
      textInput("audience", "Audience", "Young professionals, luxury buyers, busy founders"),
      textInput("vibe", "Vibe", "Quiet premium, bright energetic, cinematic minimal"),
      textInput("imageryStyle", "Imagery Style", "Studio product photos, lifestyle editorial, candid moments", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Include vibe, colours, textures, typography, imagery, lighting, and layout style.",
        "Make the prompt detailed enough for a designer or image model to follow.",
        "Keep the aesthetic cohesive.",
      ],
      outputFields: [textOutput("moodboardPrompt", "Moodboard Prompt")],
    },
  },
  {
    id: "website-section",
    name: "AI Website Section Generator",
    category: "design",
    description: "Generate core website section copy for a business or landing page.",
    inputs: [
      textInput("business", "Business", "Performance marketing agency, salon, coaching program"),
      textInput("offer", "Offer", "Monthly retainer, premium facial package, online course"),
      textInput("audience", "Audience", "Founders, brides-to-be, job seekers"),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Generate useful website copy for the key sections a visitor expects.",
        "Keep the writing clear, concrete, and conversion-focused.",
        "Make the sections feel consistent with each other.",
      ],
      outputFields: [
        textOutput("heroSection", "Hero Section"),
        textOutput("featuresSection", "Features Section"),
        textOutput("benefitsSection", "Benefits Section"),
        textOutput("testimonialsSection", "Testimonials Section"),
        textOutput("pricingSection", "Pricing Section"),
        textOutput("faqSection", "FAQ Section"),
        textOutput("ctaSection", "CTA Section"),
      ],
    },
  },
  {
    id: "portfolio-bio",
    name: "AI Portfolio Bio Generator",
    category: "design",
    description: "Write portfolio bios for freelancers, creators, designers, and consultants.",
    inputs: [
      textInput("profession", "Profession", "Product designer, freelance marketer, developer"),
      textInput("specialty", "Specialty", "Landing pages, motion graphics, full-stack apps"),
      textInput("experience", "Experience", "3 years, 20+ projects, in-house plus freelance"),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Write bios that feel credible, human, and portfolio-ready.",
        "Vary the versions in tone and format.",
        "Include a CTA-oriented version that invites contact or collaboration.",
      ],
      outputFields: [
        textOutput("shortBio", "Short Bio"),
        textOutput("professionalBio", "Professional Bio"),
        textOutput("creativeBio", "Creative Bio"),
        textOutput("ctaBio", "CTA Bio"),
      ],
    },
  },
  {
    id: "thumbnail-idea",
    name: "AI YouTube Thumbnail Idea Generator",
    category: "design",
    description: "Conceptualize YouTube thumbnails with visual hierarchy and click appeal.",
    inputs: [
      textInput("videoTopic", "Video Topic", "How I built a SaaS in 30 days"),
      textInput("audience", "Audience", "Creators, developers, marketers"),
      textInput("style", "Style", "Bold, clean, dramatic, high-energy"),
      textInput("emotion", "Emotion", "Shock, curiosity, confidence", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Describe the thumbnail concept, not the full video strategy.",
        "Include visual idea, facial expression if relevant, overlay text, colours, background, and composition.",
        "Make it feel clickable without becoming misleading.",
      ],
      outputFields: [
        textOutput("thumbnailIdea", "Thumbnail Idea"),
        textOutput("mainVisual", "Main Visual"),
        textOutput("textOnThumbnail", "Text on Thumbnail"),
        textOutput("colors", "Colors"),
        textOutput("composition", "Composition"),
      ],
    },
  },
  {
    id: "ad-banner-text",
    name: "AI Ad Banner Text Generator",
    category: "design",
    description: "Generate short, punchy banner text for promotions, ads, and site headers.",
    inputs: [
      textInput("product", "Product or Offer", "Summer sale, AI audit, premium haircut package"),
      textInput("audience", "Audience", "New visitors, returning buyers, local customers", {
        required: false,
      }),
      textInput("offer", "Promo Angle", "20% off, book today, free setup included"),
    ],
    prompt: {
      instructions: [
        "Keep the banner copy short and conversion-focused.",
        "Make the lines easy to read in tight spaces.",
        "Give usable variation instead of near-duplicates.",
      ],
      outputFields: [
        listOutput("headlineOptions", "Headline Options", 5),
        listOutput("subheadlineOptions", "Subheadline Options", 5),
        listOutput("ctaOptions", "CTA Options", 5),
      ],
    },
  },
];
