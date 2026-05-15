import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface NoteDocument extends Document {
  user: Types.ObjectId;
  project: Types.ObjectId | null;
  task: Types.ObjectId | null;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<NoteDocument>(
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
      default: null,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    title: {
      type: String,
      maxlength: 200,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      maxlength: 50000,
      default: "",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, project: 1, updatedAt: -1 });
noteSchema.index({ user: 1, task: 1, updatedAt: -1 });
noteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

export const Note: Model<NoteDocument> =
  mongoose.models.Note || mongoose.model<NoteDocument>("Note", noteSchema);
