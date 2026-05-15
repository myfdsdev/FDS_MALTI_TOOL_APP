import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ProjectStatus = "active" | "archived" | "completed";

export interface ProjectDocument extends Document {
  user: Types.ObjectId;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  members: Types.ObjectId[];
  taskCount: number;
  completedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

const projectSchema = new Schema<ProjectDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 120,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: "",
      trim: true,
    },
    color: {
      type: String,
      default: "#4F46E5",
      validate: {
        validator: (value: string) => HEX_COLOR_REGEX.test(value),
        message: "Color must be a valid hex value",
      },
    },
    icon: {
      type: String,
      default: "folder",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "completed"] as const,
      default: "active",
      index: true,
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    taskCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, status: 1 });

export const Project: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>("Project", projectSchema);
