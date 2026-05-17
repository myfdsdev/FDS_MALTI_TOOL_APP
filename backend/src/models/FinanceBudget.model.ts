import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface FinanceBudgetDocument extends Document {
  user: Types.ObjectId;
  /** Month in "YYYY-MM" form. */
  month: string;
  /** Null means total monthly budget across all categories. */
  category: string | null;
  limitAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const financeBudgetSchema = new Schema<FinanceBudgetDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => MONTH_REGEX.test(v),
        message: "Month must be in YYYY-MM format",
      },
    },
    category: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 60,
    },
    limitAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// One budget per (user, month, category). category=null is the overall budget.
financeBudgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

export const FinanceBudget: Model<FinanceBudgetDocument> =
  mongoose.models.FinanceBudget ||
  mongoose.model<FinanceBudgetDocument>("FinanceBudget", financeBudgetSchema);
