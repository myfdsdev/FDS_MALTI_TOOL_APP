import { z } from "zod";

const hexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color");
const templateSchema = z.enum([
  "modern",
  "classic",
  "minimal",
  "creative",
  "compact",
  "executive",
]);
const fontFamilySchema = z.enum(["inter", "serif", "mono", "sans"]);

const personalSchema = z
  .object({
    fullName: z.string().max(200).optional(),
    jobTitle: z.string().max(200).optional(),
    email: z.string().max(200).optional(),
    phone: z.string().max(80).optional(),
    location: z.string().max(200).optional(),
    website: z.string().max(500).optional(),
    linkedin: z.string().max(500).optional(),
    github: z.string().max(500).optional(),
    summary: z.string().max(3000).optional(),
  })
  .partial();

const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().max(200).optional().default(""),
  role: z.string().max(200).optional().default(""),
  location: z.string().max(200).optional().default(""),
  startDate: z.string().max(40).optional().default(""),
  endDate: z.string().max(40).nullable().optional().default(null),
  current: z.boolean().optional().default(false),
  bullets: z.array(z.string().max(1500)).optional().default([]),
});

const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().max(200).optional().default(""),
  degree: z.string().max(200).optional().default(""),
  field: z.string().max(200).optional().default(""),
  location: z.string().max(200).optional().default(""),
  startDate: z.string().max(40).optional().default(""),
  endDate: z.string().max(40).nullable().optional().default(null),
  gpa: z.string().max(40).optional().default(""),
  notes: z.string().max(1500).optional().default(""),
});

const skillGroupSchema = z.object({
  id: z.string().min(1),
  category: z.string().max(120).optional().default(""),
  items: z.array(z.string().max(120)).optional().default([]),
});

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(200).optional().default(""),
  link: z.string().max(500).optional().default(""),
  description: z.string().max(1500).optional().default(""),
  bullets: z.array(z.string().max(1500)).optional().default([]),
  tech: z.array(z.string().max(80)).optional().default([]),
});

const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(200).optional().default(""),
  issuer: z.string().max(200).optional().default(""),
  date: z.string().max(40).optional().default(""),
  link: z.string().max(500).optional().default(""),
});

const languageSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(80).optional().default(""),
  level: z.string().max(80).optional().default(""),
});

const awardSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(200).optional().default(""),
  issuer: z.string().max(200).optional().default(""),
  date: z.string().max(40).optional().default(""),
  description: z.string().max(1500).optional().default(""),
});

const contentSchema = z
  .object({
    personal: personalSchema.optional(),
    experience: z.array(experienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    skills: z.array(skillGroupSchema).optional(),
    projects: z.array(projectSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    languages: z.array(languageSchema).optional(),
    awards: z.array(awardSchema).optional(),
    hiddenSections: z.array(z.string().max(50)).optional(),
  })
  .partial();

export const createResumeSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  template: templateSchema.optional(),
  themeColor: hexColorSchema.optional(),
  fontFamily: fontFamilySchema.optional(),
  content: contentSchema.optional(),
});

export const updateResumeSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    template: templateSchema.optional(),
    themeColor: hexColorSchema.optional(),
    fontFamily: fontFamilySchema.optional(),
    content: contentSchema.optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field is required"
  );

export const starterFillSchema = z.object({
  bio: z.string().trim().min(20, "Tell us a bit more (20+ chars)").max(1000),
});

export const improveFieldSchema = z.object({
  field: z.string().min(1).max(200),
  context: z.string().max(2000).optional(),
});

export const generateBulletsSchema = z.object({
  role: z.string().trim().min(1).max(200),
  company: z.string().trim().max(200).optional().default(""),
  existingBullets: z.array(z.string().max(1500)).optional().default([]),
});

export const suggestSkillsSchema = z.object({
  jobTitle: z.string().trim().min(1).max(200),
  currentSkills: z.array(z.string().max(200)).optional().default([]),
});

export const shareSchema = z.object({
  enabled: z.boolean(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type StarterFillInput = z.infer<typeof starterFillSchema>;
export type ImproveFieldInput = z.infer<typeof improveFieldSchema>;
export type GenerateBulletsInput = z.infer<typeof generateBulletsSchema>;
export type SuggestSkillsInput = z.infer<typeof suggestSkillsSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
