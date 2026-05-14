import type { ToolDefinition } from "./types.js";
import {
  AD_PLATFORMS,
  GENERAL_TONES,
  SHORT_FORM_PLATFORMS,
  SOCIAL_PLATFORMS,
  listOutput,
  selectInput,
  textInput,
  textOutput,
  textareaInput,
} from "./shared.js";

export const marketingTools: ToolDefinition[] = [
  {
    id: "email-writer",
    name: "AI Email Writer",
    category: "marketing",
    description: "Generate a polished email with a clear subject, body, CTA, and closing.",
    inputs: [
      textInput("purpose", "Purpose", "Pitch a service, follow up after a call, request a meeting"),
      textInput("recipient", "Recipient", "Hiring manager, warm lead, client, supplier"),
      selectInput("tone", "Tone", GENERAL_TONES),
      textareaInput("keyPoints", "Key Points", "List the points that must be included in the email"),
    ],
    prompt: {
      instructions: [
        "Write the email for the exact purpose, recipient, tone, and key points provided.",
        "Always include a subject line, greeting, body, call to action, and closing.",
        "Keep it professional, clear, and ready to send without extra explanation.",
      ],
      outputFields: [
        textOutput("subject", "Subject"),
        textOutput("emailBody", "Email Body"),
      ],
    },
  },
  {
    id: "hook-generator",
    name: "AI Social Hook Generator",
    category: "marketing",
    description: "Create short, high-contrast hooks that stop the scroll.",
    inputs: [
      textInput("topic", "Topic", "Email marketing for local gyms"),
      selectInput("platform", "Platform", SOCIAL_PLATFORMS),
      textInput("audience", "Audience", "Coaches, founders, restaurant owners"),
    ],
    prompt: {
      instructions: [
        "Make the hooks short, punchy, and native to social media.",
        "Use curiosity, urgency, emotion, and pattern interruption.",
        "Avoid repetition and keep each hook distinct.",
      ],
      outputFields: [
        listOutput("shortHooks", "10 short hooks", 10),
        listOutput("boldHooks", "5 bold hooks", 5),
        listOutput("curiosityHooks", "5 curiosity hooks", 5),
        listOutput("problemBasedHooks", "5 problem-based hooks", 5),
      ],
    },
  },
  {
    id: "caption-generator",
    name: "AI Caption Generator",
    category: "marketing",
    description: "Write platform-ready captions that feel specific to the audience.",
    inputs: [
      textInput("topic", "Topic", "Launching a new AI content service"),
      selectInput("platform", "Platform", SOCIAL_PLATFORMS),
      textInput("audience", "Audience", "Creators, real estate agents, students"),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Write engaging captions tailored to the selected platform and audience.",
        "Keep the copy clear, readable, and naturally action-oriented.",
        "Do not include hashtags unless the input explicitly asks for them.",
      ],
      outputFields: [
        textOutput("caption1", "Caption 1"),
        textOutput("caption2", "Caption 2"),
        textOutput("caption3", "Caption 3"),
      ],
    },
  },
  {
    id: "hashtag-generator",
    name: "AI Hashtag Generator",
    category: "marketing",
    description: "Mix broad, niche, audience, and branded hashtags for better reach.",
    inputs: [
      textInput("topic", "Topic", "Luxury salon opening week"),
      textInput("niche", "Niche", "Beauty clinic, productivity coaching, fitness"),
      selectInput("platform", "Platform", SOCIAL_PLATFORMS),
      textInput("audience", "Audience", "Busy moms, SaaS founders, college students"),
    ],
    prompt: {
      instructions: [
        "Generate relevant hashtags only.",
        "Balance discoverability with specificity.",
        "Keep branded hashtags realistic and easy to remember.",
      ],
      outputFields: [
        listOutput("broadHashtags", "Broad Hashtags", 8),
        listOutput("nicheHashtags", "Niche Hashtags", 8),
        listOutput("audienceHashtags", "Audience Hashtags", 6),
        listOutput("brandedHashtags", "Branded Hashtags", 5),
      ],
    },
  },
  {
    id: "reel-script",
    name: "AI Reel Script Generator",
    category: "marketing",
    description: "Build short-form video scripts with scenes, voiceover, and CTA.",
    inputs: [
      textInput("topic", "Topic", "Why restaurants should use WhatsApp follow-ups"),
      selectInput("platform", "Platform", SHORT_FORM_PLATFORMS),
      textInput("audience", "Audience", "Restaurant owners, salon clients, startup founders"),
      selectInput("duration", "Duration", ["15 seconds", "30 seconds", "45 seconds", "60 seconds"]),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Start with a strong hook and keep the scene flow tight.",
        "Make the script easy to film and easy to follow.",
        "Include voiceover direction, visual direction, and a direct CTA.",
      ],
      outputFields: [
        textOutput("hook", "Hook"),
        textOutput("scene1", "Scene 1"),
        textOutput("scene2", "Scene 2"),
        textOutput("scene3", "Scene 3"),
        textOutput("voiceover", "Voiceover"),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "ad-copy-generator",
    name: "AI Ad Copy Generator",
    category: "marketing",
    description: "Generate pain-point-driven ad copy for major ad platforms.",
    inputs: [
      textInput("productOffer", "Product or Offer", "AI lead generation package for dentists"),
      selectInput("platform", "Platform", AD_PLATFORMS),
      textInput("audience", "Audience", "Local business owners in New York"),
      textInput("painPoint", "Pain Point", "Low lead volume and inconsistent follow-up"),
      textareaInput("offerDetails", "Offer Details", "Free audit, 7-day trial, seasonal discount"),
      textInput("proof", "Proof", "Used by 120+ brands, 3.8x ROAS, 50 five-star reviews", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on pain point, benefit, offer, proof, urgency, and CTA.",
        "Match the writing style to the platform.",
        "Keep the copy conversion-focused and easy to scan.",
      ],
      outputFields: [
        textOutput("primaryText", "Primary Text"),
        textOutput("headline", "Headline"),
        textOutput("description", "Description"),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "product-description",
    name: "AI Product Description Writer",
    category: "marketing",
    description: "Write ecommerce product descriptions that feel clear, useful, and persuasive.",
    inputs: [
      textInput("productName", "Product Name", "Portable blender bottle"),
      textInput("productType", "Product Type", "Skincare, gadget, supplement, kitchen tool"),
      textareaInput("features", "Features", "USB charging, leakproof lid, lightweight body"),
      textInput("audience", "Audience", "Gym-goers, new moms, remote workers"),
      textInput("useCase", "Use Case", "Travel, gifting, daily routine, office desk"),
    ],
    prompt: {
      instructions: [
        "Highlight benefits, features, practical use cases, and emotional appeal.",
        "Make the description easy to understand and genuinely persuasive.",
        "Avoid fake claims or exaggerated guarantees.",
      ],
      outputFields: [
        textOutput("productTitle", "Product Title"),
        textOutput("shortDescription", "Short Description"),
        textOutput("detailedDescription", "Detailed Description"),
        listOutput("keyBenefits", "Key Benefits", 5),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "landing-page-copy",
    name: "AI Landing Page Copy Generator",
    category: "marketing",
    description: "Create complete landing page messaging for offers, products, and services.",
    inputs: [
      textInput("offer", "Offer", "Done-for-you ad creative for ecommerce brands"),
      textInput("audience", "Audience", "Coaches, SaaS teams, local businesses"),
      textareaInput("problem", "Problem", "What pain or frustration is the audience dealing with?"),
      textareaInput("solution", "Solution", "What makes the offer different and valuable?"),
      textInput("socialProof", "Social Proof", "50+ clients served, featured in industry media", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Write a full landing page copy deck with a strong hero, clear value, benefits, proof, FAQ, and CTA.",
        "Keep the copy concrete and commercial rather than fluffy.",
        "Make the headline and subheadline feel sharp and marketable.",
      ],
      outputFields: [
        textOutput("heroHeadline", "Hero Headline"),
        textOutput("subheadline", "Subheadline"),
        textOutput("problemSection", "Problem Section"),
        textOutput("solutionSection", "Solution Section"),
        listOutput("features", "Features", 5),
        listOutput("benefits", "Benefits", 5),
        textOutput("cta", "CTA"),
        listOutput("faq", "FAQ", 5),
      ],
    },
  },
  {
    id: "whatsapp-writer",
    name: "AI WhatsApp Message Writer",
    category: "marketing",
    description: "Write natural WhatsApp messages for sales, follow-up, reminders, and replies.",
    inputs: [
      selectInput("messageType", "Message Type", [
        "Sales",
        "Follow-up",
        "Reminder",
        "Offer",
        "Customer reply",
      ]),
      textareaInput("context", "Context", "What happened before this message, and what should it achieve?"),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Keep the messages short, conversational, and human.",
        "Avoid sounding robotic, spammy, or overly formal.",
        "Write in a way that feels natural inside WhatsApp.",
      ],
      outputFields: [
        textOutput("message1", "Message 1"),
        textOutput("message2", "Message 2"),
        textOutput("message3", "Message 3"),
      ],
    },
  },
  {
    id: "cold-dm-generator",
    name: "AI Cold DM Generator",
    category: "marketing",
    description: "Generate concise outreach DMs that feel personal instead of spammy.",
    inputs: [
      selectInput("platform", "Platform", ["Instagram", "LinkedIn", "X / Twitter", "Facebook"]),
      textInput("target", "Target", "Agency owners, ecommerce founders, local clinic managers"),
      textInput("goal", "Goal", "Book a discovery call, start a conversation, offer an audit"),
      textInput("offer", "Offer", "Free landing page teardown", { required: false }),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Keep messages short, personal, and respectful.",
        "Avoid desperation, pressure, and generic spam language.",
        "Make each variation feel like a believable outreach message.",
      ],
      outputFields: [
        textOutput("dm1", "DM 1"),
        textOutput("dm2", "DM 2"),
        textOutput("dm3", "DM 3"),
        textOutput("followUpMessage", "Follow-up Message"),
      ],
    },
  },
];
