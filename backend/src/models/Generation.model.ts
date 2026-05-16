import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface GenerationDocument extends Document {
  user: Types.ObjectId;
  toolId: string;
  toolName: string;
  category: string;
  inputs: Record<string, unknown>;
  output: unknown;
  mode: "mock" | "live" | "scrape" | "utility";
  status: "active" | "deleted";
  durationMs?: number;
  tokenCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const generationSchema = new Schema<GenerationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toolId: { type: String, required: true, index: true },
    toolName: { type: String, required: true },
    category: { type: String, required: true },
    inputs: { type: Schema.Types.Mixed, default: {} },
    output: Schema.Types.Mixed,
    mode: { type: String, enum: ["mock", "live", "scrape", "utility"], default: "mock" },
    status: { type: String, enum: ["active", "deleted"], default: "active", index: true },
    durationMs: Number,
    tokenCount: Number,
  },
  { timestamps: true }
);

// Compound indexes for common queries
generationSchema.index({ user: 1, createdAt: -1 });
generationSchema.index({ user: 1, toolId: 1, createdAt: -1 });

export const Generation: Model<GenerationDocument> =
  mongoose.models.Generation || mongoose.model<GenerationDocument>("Generation", generationSchema);
