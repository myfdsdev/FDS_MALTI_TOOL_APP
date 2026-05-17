import mongoose, { Schema, type Document, type Model } from "mongoose";
import { AI_PROVIDERS, defaultModelFor, type AIProvider } from "../config/ai.config.js";

export interface SettingsDocument extends Document {
  aiProvider: AIProvider;
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    aiProvider: { type: String, enum: AI_PROVIDERS, default: "openai-compatible" },
    aiApiKey: { type: String, select: false },
    aiBaseUrl: { type: String },
    aiModel: { type: String, default: defaultModelFor("openai-compatible") },
  },
  { timestamps: true },
);

export const Settings: Model<SettingsDocument> =
  mongoose.models.Settings ||
  mongoose.model<SettingsDocument>("Settings", settingsSchema);

export async function ensureSettings(): Promise<SettingsDocument> {
  const existing = await Settings.findOne().select("+aiApiKey");
  if (existing) return existing;
  return Settings.create({});
}
