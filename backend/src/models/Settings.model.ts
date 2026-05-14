import mongoose, { Schema, type Document, type Model } from "mongoose";
import { AI_PROVIDERS, defaultModelFor, type AIProvider } from "../config/ai.config.js";

export interface SettingsDocument extends Document {
  aiProvider: AIProvider;
  aiApiKey?: string;
  anthropicApiKey?: string;
  aiBaseUrl?: string;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    aiProvider: { type: String, enum: AI_PROVIDERS, default: "anthropic" },
    aiApiKey: { type: String, select: false },
    // Legacy field preserved for older saved documents.
    anthropicApiKey: { type: String, select: false },
    aiBaseUrl: { type: String },
    aiModel: { type: String, default: defaultModelFor("anthropic") },
  },
  { timestamps: true },
);

export const Settings: Model<SettingsDocument> =
  mongoose.models.Settings ||
  mongoose.model<SettingsDocument>("Settings", settingsSchema);

export async function ensureSettings(): Promise<SettingsDocument> {
  const existing = await Settings.findOne().select("+aiApiKey +anthropicApiKey");
  if (existing) return existing;
  return Settings.create({});
}
