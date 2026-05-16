import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ResumeTemplate =
  | "modern"
  | "classic"
  | "minimal"
  | "creative"
  | "compact"
  | "executive";

export type ResumeFontFamily = "inter" | "serif" | "mono" | "sans";

export interface ResumePersonal {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  gpa: string;
  notes: string;
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  link: string;
  description: string;
  bullets: string[];
  tech: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: string;
}

export interface ResumeAward {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface ResumeContent {
  personal: ResumePersonal;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkillGroup[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  awards: ResumeAward[];
  hiddenSections?: string[];
}

export interface ResumeShare {
  enabled: boolean;
  slug: string | null;
  viewCount: number;
  lastViewedAt: Date | null;
}

export interface ATSIssue {
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}

export interface ResumeDocument extends Document {
  user: Types.ObjectId;
  title: string;
  template: ResumeTemplate;
  themeColor: string;
  fontFamily: ResumeFontFamily;
  content: ResumeContent;
  share: ResumeShare;
  atsScore: number | null;
  atsIssues: ATSIssue[];
  atsSuggestions: string[];
  lastEditedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

const personalSchema = new Schema<ResumePersonal>(
  {
    fullName: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { _id: false }
);

const experienceSchema = new Schema<ResumeExperience>(
  {
    id: { type: String, required: true },
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: null },
    current: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new Schema<ResumeEducation>(
  {
    id: { type: String, required: true },
    institution: { type: String, default: "" },
    degree: { type: String, default: "" },
    field: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: null },
    gpa: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const skillGroupSchema = new Schema<ResumeSkillGroup>(
  {
    id: { type: String, required: true },
    category: { type: String, default: "" },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const projectSchema = new Schema<ResumeProject>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    link: { type: String, default: "" },
    description: { type: String, default: "" },
    bullets: { type: [String], default: [] },
    tech: { type: [String], default: [] },
  },
  { _id: false }
);

const certificationSchema = new Schema<ResumeCertification>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    issuer: { type: String, default: "" },
    date: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const languageSchema = new Schema<ResumeLanguage>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    level: { type: String, default: "" },
  },
  { _id: false }
);

const awardSchema = new Schema<ResumeAward>(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    issuer: { type: String, default: "" },
    date: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const contentSchema = new Schema<ResumeContent>(
  {
    personal: { type: personalSchema, default: () => ({}) },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    skills: { type: [skillGroupSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    languages: { type: [languageSchema], default: [] },
    awards: { type: [awardSchema], default: [] },
    hiddenSections: { type: [String], default: [] },
  },
  { _id: false }
);

const shareSchema = new Schema<ResumeShare>(
  {
    enabled: { type: Boolean, default: false },
    slug: {
      type: String,
      default: null,
    },
    viewCount: { type: Number, default: 0, min: 0 },
    lastViewedAt: { type: Date, default: null },
  },
  { _id: false }
);

const atsIssueSchema = new Schema<ATSIssue>(
  {
    severity: { type: String, enum: ["error", "warning", "info"], required: true },
    message: { type: String, required: true },
    field: { type: String },
  },
  { _id: false }
);

const resumeSchema = new Schema<ResumeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 120,
      trim: true,
      default: "Untitled Resume",
    },
    template: {
      type: String,
      enum: ["modern", "classic", "minimal", "creative", "compact", "executive"] as const,
      default: "modern",
    },
    themeColor: {
      type: String,
      default: "#4F46E5",
      validate: {
        validator: (value: string) => HEX_COLOR_REGEX.test(value),
        message: "themeColor must be a valid hex value",
      },
    },
    fontFamily: {
      type: String,
      enum: ["inter", "serif", "mono", "sans"] as const,
      default: "inter",
    },
    content: { type: contentSchema, default: () => ({}) },
    share: { type: shareSchema, default: () => ({}) },
    atsScore: { type: Number, default: null, min: 0, max: 100 },
    atsIssues: { type: [atsIssueSchema], default: [] },
    atsSuggestions: { type: [String], default: [] },
    lastEditedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ "share.slug": 1 }, { unique: true, sparse: true });

export const Resume: Model<ResumeDocument> =
  mongoose.models.Resume || mongoose.model<ResumeDocument>("Resume", resumeSchema);
