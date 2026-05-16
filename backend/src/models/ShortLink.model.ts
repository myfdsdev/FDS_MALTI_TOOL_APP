import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ShortLinkDocument extends Document {
  user: Types.ObjectId;
  originalUrl: string;
  code: string;
  clicks: number;
  status: "active" | "deleted";
  lastClickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const shortLinkSchema = new Schema<ShortLinkDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    originalUrl: { type: String, required: true, trim: true, maxlength: 5000 },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
    },
    clicks: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "deleted"], default: "active", index: true },
    lastClickedAt: Date,
  },
  { timestamps: true },
);

shortLinkSchema.index({ user: 1, createdAt: -1 });
shortLinkSchema.index({ user: 1, status: 1, createdAt: -1 });

export const ShortLink: Model<ShortLinkDocument> =
  mongoose.models.ShortLink || mongoose.model<ShortLinkDocument>("ShortLink", shortLinkSchema);
