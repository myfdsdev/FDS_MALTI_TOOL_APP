import { z } from "zod";

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

const transactionTypeSchema = z.enum(["expense", "income"]);
const transactionSourceSchema = z.enum([
  "salary",
  "freelance",
  "cash",
  "card",
  "upi",
  "bank",
  "other",
]);

const amountSchema = z
  .number({ invalid_type_error: "Amount must be a number" })
  .finite()
  .nonnegative()
  .max(1_000_000_000);

const categorySchema = z.string().trim().min(1).max(60);

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: amountSchema,
  category: categorySchema,
  date: z.coerce.date(),
  note: z.string().trim().max(500).optional().default(""),
  source: transactionSourceSchema.nullable().optional().default(null),
});

export const updateTransactionSchema = z
  .object({
    type: transactionTypeSchema.optional(),
    amount: amountSchema.optional(),
    category: categorySchema.optional(),
    date: z.coerce.date().optional(),
    note: z.string().trim().max(500).optional(),
    source: transactionSourceSchema.nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");

export const listTransactionsQuerySchema = z.object({
  month: monthSchema.optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().trim().min(1).max(60).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(100),
});

export const summaryQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const createBudgetSchema = z.object({
  month: monthSchema,
  category: categorySchema.nullable().optional().default(null),
  limitAmount: amountSchema,
});

export const updateBudgetSchema = z
  .object({
    month: monthSchema.optional(),
    category: categorySchema.nullable().optional(),
    limitAmount: amountSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");

export const listBudgetsQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  targetAmount: z.number().positive().max(1_000_000_000),
  currentAmount: amountSchema.optional().default(0),
  targetDate: z.coerce.date().nullable().optional().default(null),
  status: z.enum(["active", "completed", "archived"]).optional().default("active"),
});

export const updateSavingsGoalSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    targetAmount: z.number().positive().max(1_000_000_000).optional(),
    currentAmount: amountSchema.optional(),
    targetDate: z.coerce.date().nullable().optional(),
    status: z.enum(["active", "completed", "archived"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQueryInput = z.infer<typeof listTransactionsQuerySchema>;
export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ListBudgetsQueryInput = z.infer<typeof listBudgetsQuerySchema>;
export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
export type UpdateSavingsGoalInput = z.infer<typeof updateSavingsGoalSchema>;
