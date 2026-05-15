import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskDocument extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  progress: number;
  checklist: ChecklistItem[];
  tags: string[];
  assignee: Types.ObjectId | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<ChecklistItem>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const taskSchema = new Schema<TaskDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"] as const,
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"] as const,
      default: "medium",
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, project: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, project: 1, position: 1 });

export const Task: Model<TaskDocument> =
  mongoose.models.Task || mongoose.model<TaskDocument>("Task", taskSchema);
