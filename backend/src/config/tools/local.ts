import type { ToolDefinition } from "./types.js";
import { GENERAL_TONES, listOutput, selectInput, textInput, textOutput, textareaInput } from "./shared.js";

export const localBusinessTools: ToolDefinition[] = [
  {
    id: "restaurant-promo",
    name: "AI Restaurant Promo Generator",
    category: "local",
    description: "Generate restaurant marketing assets across offers, reels, ads, and WhatsApp.",
    inputs: [
      textInput("restaurantName", "Restaurant Name", "Casa Verde"),
      textInput("cuisine", "Cuisine", "Italian, cafe, cloud kitchen, bakery"),
      textInput("specialty", "Specialty", "Wood-fired pizza, matcha desserts, lunch combos"),
      textInput("offer", "Offer", "Buy one get one, weekday lunch deal", { required: false }),
      textInput("audience", "Audience", "Families, office workers, students", { required: false }),
    ],
    prompt: {
      instructions: [
        "Create practical, marketing-ready content for a restaurant or cafe.",
        "Keep the copy appetizing, local-business friendly, and action-oriented.",
        "Make each section feel distinct rather than reworded copies of the same idea.",
      ],
      outputFields: [
        textOutput("offerIdea", "Offer Idea"),
        textOutput("caption", "Caption"),
        textOutput("reelScript", "Reel Script"),
        textOutput("adCopy", "Ad Copy"),
        textOutput("whatsappMessage", "WhatsApp Message"),
      ],
    },
  },
  {
    id: "gym-marketing",
    name: "AI Gym Marketing Generator",
    category: "local",
    description: "Build marketing content for gyms, trainers, and wellness studios.",
    inputs: [
      textInput("gymName", "Gym Name", "Iron District"),
      textInput("service", "Service", "Weight loss coaching, group classes, PT sessions"),
      textInput("offer", "Offer", "7-day free trial, first session free"),
      textInput("transformation", "Transformation", "More energy, stronger body, accountability", {
        required: false,
      }),
      textInput("audience", "Audience", "Beginners, women 30+, office workers", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on transformation, trial offers, memberships, motivation, and local lead generation.",
        "Keep the copy supportive and action-driven.",
        "Avoid fake body promises or unrealistic claims.",
      ],
      outputFields: [
        textOutput("offerIdea", "Offer Idea"),
        textOutput("adCopy", "Ad Copy"),
        textOutput("reelScript", "Reel Script"),
        textOutput("whatsappMessage", "WhatsApp Message"),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "real-estate-listing",
    name: "AI Real Estate Listing Writer",
    category: "local",
    description: "Write listing copy that covers property details, lifestyle, and investment angle.",
    inputs: [
      textInput("propertyType", "Property Type", "2BHK apartment, villa, commercial office"),
      textInput("location", "Location", "Downtown Austin, Whitefield Bangalore"),
      textareaInput("features", "Features", "Balcony, parking, pool access, renovated kitchen"),
      textInput("targetBuyer", "Target Buyer", "Young family, investor, remote professional", {
        required: false,
      }),
      textInput("priceContext", "Price Context", "Premium, value-focused, below market", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Cover the location, property type, standout features, lifestyle benefits, and investment angle where relevant.",
        "Write in a way that helps the property feel tangible.",
        "Keep the CTA clear and grounded.",
      ],
      outputFields: [
        textOutput("listingTitle", "Listing Title"),
        textOutput("shortDescription", "Short Description"),
        textOutput("detailedDescription", "Detailed Description"),
        listOutput("keyFeatures", "Key Features", 5),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "salon-offer",
    name: "AI Salon Offer Generator",
    category: "local",
    description: "Create salon and beauty clinic offers with supporting promo copy.",
    inputs: [
      textInput("salonName", "Salon Name", "Studio Bloom"),
      textareaInput("services", "Services", "Hair color, bridal makeup, hydrafacial"),
      textInput("audience", "Audience", "Brides, working professionals, students", {
        required: false,
      }),
      textInput("occasion", "Occasion", "Wedding season, weekend promotion, festive launch", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Create an offer that feels clear, appealing, and easy to promote.",
        "Make the copy beauty-business appropriate and client-friendly.",
        "Keep the messaging concise and usable.",
      ],
      outputFields: [
        textOutput("offerName", "Offer Name"),
        textOutput("offerDetails", "Offer Details"),
        textOutput("socialCaption", "Social Caption"),
        textOutput("whatsappMessage", "WhatsApp Message"),
        textOutput("cta", "CTA"),
      ],
    },
  },
  {
    id: "doctor-clinic-content",
    name: "AI Doctor Clinic Content Generator",
    category: "local",
    description: "Generate educational and appointment-focused clinic content without unsafe claims.",
    inputs: [
      textInput("specialty", "Specialty", "Dentist, dermatologist, pediatrician"),
      textInput("contentType", "Content Goal", "Education, awareness, seasonal reminder"),
      textInput("service", "Service", "Root canal, acne treatment, vaccination", {
        required: false,
      }),
      textInput("audience", "Audience", "Parents, adults with skin concerns, elderly patients", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Keep the content safe, informative, and non-misleading.",
        "Do not guarantee medical outcomes or invent specific medical advice.",
        "Use an educational tone with a soft, appointment-oriented CTA.",
      ],
      outputFields: [
        textOutput("postIdea", "Post Idea"),
        textOutput("caption", "Caption"),
        textOutput("educationalContent", "Educational Content"),
        textOutput("appointmentCta", "Appointment CTA"),
      ],
    },
  },
  {
    id: "coaching-class-ad",
    name: "AI Coaching Class Ad Generator",
    category: "local",
    description: "Generate ad copy for tutors, classes, and education offers.",
    inputs: [
      textInput("subject", "Subject", "Maths, IELTS, coding, UPSC"),
      textInput("audience", "Audience", "Class 10 students, graduates, working professionals"),
      textInput("offer", "Offer", "Free demo class, scholarship test, early batch discount"),
      textInput("outcome", "Outcome", "Better scores, exam confidence, structured prep", {
        required: false,
      }),
    ],
    prompt: {
      instructions: [
        "Focus on benefits, offer clarity, and credible motivation.",
        "Keep the copy parent-safe and student-friendly.",
        "Make the CTA clear and enrollment-oriented.",
      ],
      outputFields: [
        textOutput("adHeadline", "Ad Headline"),
        textOutput("primaryText", "Primary Text"),
        listOutput("benefits", "Benefits", 5),
        textOutput("offer", "Offer"),
        textOutput("cta", "CTA"),
      ],
    },
  },
];
