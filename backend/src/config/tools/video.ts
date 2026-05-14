import type { ToolDefinition } from "./types.js";
import { GENERAL_TONES, SHORT_FORM_PLATFORMS, listOutput, selectInput, textInput, textOutput, textareaInput } from "./shared.js";

export const videoTools: ToolDefinition[] = [
  {
    id: "video-prompt",
    name: "AI Video Prompt Generator",
    category: "video",
    description: "Write text-to-video prompts with cinematic detail and motion direction.",
    inputs: [
      textInput("subject", "Subject", "A chef plating a luxury dessert"),
      textInput("action", "Action", "Slowly slicing, pouring, assembling, walking into frame"),
      textInput("scene", "Scene", "Moody restaurant kitchen, rainy city rooftop, bright studio"),
      textInput("mood", "Mood", "Cinematic, dreamy, gritty, calm"),
      textInput("style", "Style", "Commercial, documentary, anime, photoreal", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Include subject, action, scene, camera movement, lighting, mood, style, and ending.",
        "Write the prompt as a single detailed block ready for a video model.",
        "Keep the visuals specific and coherent.",
      ],
      outputFields: [textOutput("videoPrompt", "Video Prompt")],
    },
  },
  {
    id: "image-prompt",
    name: "AI Image Prompt Generator",
    category: "video",
    description: "Write strong text-to-image prompts with composition, lighting, and style details.",
    inputs: [
      textInput("subject", "Subject", "Premium skincare bottle"),
      textInput("environment", "Environment", "Marble sink, desert landscape, futuristic office"),
      textInput("lighting", "Lighting", "Soft morning light, dramatic rim light", {
        required: false,
      }),
      textInput("style", "Style", "Editorial, cinematic, product photography, anime"),
      textInput("colors", "Colours", "Warm neutrals with emerald accents", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Include subject, environment, lighting, camera angle, style, colours, details, and composition.",
        "Write a detailed prompt ready for an image model.",
        "Keep the prompt visually vivid and internally consistent.",
      ],
      outputFields: [textOutput("imagePrompt", "Image Prompt")],
    },
  },
  {
    id: "ugc-script",
    name: "AI UGC Script Generator",
    category: "video",
    description: "Generate natural UGC scripts that feel casual, credible, and conversion-focused.",
    inputs: [
      textInput("productName", "Product or Service", "Teeth whitening kit, note-taking app, meal prep service"),
      textInput("audience", "Audience", "Students, busy professionals, new parents"),
      textInput("problem", "Problem", "Messy notes, low confidence, no time to cook"),
      selectInput("tone", "Tone", GENERAL_TONES, undefined, { required: false }),
    ],
    prompt: {
      instructions: [
        "Make the script sound natural and personal, not polished like a brand ad.",
        "Keep the flow believable for a creator-style video.",
        "Anchor the script in a real problem and a practical benefit.",
      ],
      outputFields: [
        textOutput("hook", "Hook"),
        textOutput("problem", "Problem"),
        textOutput("personalExperience", "Personal Experience"),
        textOutput("productMention", "Product Mention"),
        textOutput("benefit", "Benefit"),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "product-video-prompt",
    name: "AI Product Video Prompt Generator",
    category: "video",
    description: "Write cinematic product video prompts focused on premium visual storytelling.",
    inputs: [
      textInput("product", "Product", "Luxury watch, protein bar, ceramic cup"),
      textInput("style", "Style", "Premium commercial, clean studio, moody lifestyle"),
      textInput("usageContext", "Usage Context", "Morning desk setup, gym bag reveal, bathroom shelf"), 
      textInput("keyDetail", "Key Detail", "Texture, reflections, packaging, ingredients", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on premium close-ups, usage, lighting, product details, transitions, and the final hero shot.",
        "Write a cinematic prompt for a product-focused video model.",
        "Keep the sequence visually elegant and brand-friendly.",
      ],
      outputFields: [textOutput("productVideoPrompt", "Product Video Prompt")],
    },
  },
  {
    id: "faceless-video-idea",
    name: "AI Faceless Video Idea Generator",
    category: "video",
    description: "Generate video ideas that work without showing anyone's face on camera.",
    inputs: [
      textInput("topic", "Topic", "Personal finance, social media tips, home workouts"),
      textInput("niche", "Niche", "Coaching, ecommerce, local service business"),
      textInput("audience", "Audience", "Students, founders, busy moms", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Ideas should be practical to produce without showing a face.",
        "Favor formats like screen recordings, b-roll, text-led storytelling, demos, and hands-only shots.",
        "Make the ideas specific enough to act on.",
      ],
      outputFields: [listOutput("facelessVideoIdeas", "20 faceless video ideas", 20)],
    },
  },
  {
    id: "storyboard-generator",
    name: "AI Storyboard Generator",
    category: "video",
    description: "Turn an idea or script into a scene-by-scene storyboard with prompts.",
    inputs: [
      textareaInput("script", "Script or Idea", "Paste the script, or describe the video concept"),
      selectInput("platform", "Platform", SHORT_FORM_PLATFORMS, undefined, { required: false }),
      textInput("duration", "Duration", "30 seconds, 60 seconds", { required: false }),
    ],
    prompt: {
      instructions: [
        "Break the concept into a sequence of clear scenes.",
        "For each scene, include duration, visuals, camera movement, voiceover, and an image or video prompt.",
        "Keep the scenes practical to produce and visually distinct.",
      ],
      outputFields: [listOutput("storyboardScenes", "Storyboard Scenes", 5)],
    },
  },
  {
    id: "voiceover-script",
    name: "AI Voiceover Script Generator",
    category: "video",
    description: "Write clear, emotionally usable voiceover scripts for ads, explainers, and reels.",
    inputs: [
      textInput("topic", "Topic", "Explaining a new AI planner app"),
      textInput("audience", "Audience", "Founders, moms, fitness beginners", {
        required: false,
      }),
      selectInput("duration", "Duration", ["15 seconds", "30 seconds", "45 seconds", "60 seconds"]),
      selectInput("tone", "Tone", GENERAL_TONES),
    ],
    prompt: {
      instructions: [
        "Make the script easy to say out loud.",
        "Use emotional clarity without sounding melodramatic.",
        "Keep it suited to the requested format and duration.",
      ],
      outputFields: [textOutput("voiceoverScript", "Voiceover Script")],
    },
  },
  {
    id: "hook-script-cta",
    name: "AI Hook + Script + CTA Generator",
    category: "video",
    description: "Generate a full short-form content package with hooks, script, visuals, caption, and CTA.",
    inputs: [
      textInput("topic", "Topic", "How to get better quality leads from Meta ads"),
      selectInput("platform", "Platform", SHORT_FORM_PLATFORMS),
      textInput("audience", "Audience", "Coaches, ecommerce founders, local clinics"),
      textInput("offer", "Offer", "Free audit, guide download, strategy call", {
        required: false,
      }),
      selectInput("tone", "Tone", GENERAL_TONES, undefined, { required: false }),
    ],
    prompt: {
      instructions: [
        "Give the user a complete short-form package they can film or brief to a creator.",
        "Make the hook set varied and the CTA aligned with the offer.",
        "Keep the caption and visual direction tightly connected to the script.",
      ],
      outputFields: [
        listOutput("hooks", "Hooks", 5),
        textOutput("script", "Script"),
        textOutput("visualDirection", "Visual Direction"),
        textOutput("caption", "Caption"),
        textOutput("cta", "CTA"),
      ],
    },
  },
];
