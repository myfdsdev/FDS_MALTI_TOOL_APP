import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type TransactionType = "expense" | "income";
export type TransactionSource =
  | "salary"
  | "freelance"
  | "cash"
  | "card"
  | "upi"
  | "bank"
  | "other";

export const TRANSACTION_TYPES: TransactionType[] = ["expense", "income"];
export const TRANSACTION_SOURCES: TransactionSource[] = [
  "salary",
  "freelance",
  "cash",
  "card",
  "upi",
  "bank",
  "other",
];

export interface FinanceTransactionDocument extends Document {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  date: Date;
  note: string;
  source: TransactionSource | null;
  createdAt: Date;
  updatedAt: Date;
}

const financeTransactionSchema = new Schema<FinanceTransactionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      lowercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    source: {
      type: String,
      enum: [...TRANSACTION_SOURCES, null],
      default: null,
    },
  },
  { timestamps: true }
);

financeTransactionSchema.index({ user: 1, date: -1 });
financeTransactionSchema.index({ user: 1, type: 1, date: -1 });
financeTransactionSchema.index({ user: 1, category: 1, date: -1 });

export const FinanceTransaction: Model<FinanceTransactionDocument> =
  mongoose.models.FinanceTransaction ||
  mongoose.model<FinanceTransactionDocument>("FinanceTransaction", financeTransactionSchema);
