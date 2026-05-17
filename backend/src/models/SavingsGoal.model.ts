import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type SavingsGoalStatus = "active" | "completed" | "archived";
export const SAVINGS_GOAL_STATUSES: SavingsGoalStatus[] = ["active", "completed", "archived"];

export interface SavingsGoalDocument extends Document {
  user: Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  status: SavingsGoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const savingsGoalSchema = new Schema<SavingsGoalDocument>(
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
      trim: true,
      maxlength: 120,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: SAVINGS_GOAL_STATUSES,
      default: "active",
    },
  },
  { timestamps: true }
);

savingsGoalSchema.index({ user: 1, status: 1, updatedAt: -1 });

export const SavingsGoal: Model<SavingsGoalDocument> =
  mongoose.models.SavingsGoal ||
  mongoose.model<SavingsGoalDocument>("SavingsGoal", savingsGoalSchema);
