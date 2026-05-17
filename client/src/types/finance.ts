export type TransactionType = "expense" | "income";
export type TransactionSource =
  | "salary"
  | "freelance"
  | "cash"
  | "card"
  | "upi"
  | "bank"
  | "other";

export const TRANSACTION_SOURCES: TransactionSource[] = [
  "salary",
  "freelance",
  "cash",
  "card",
  "upi",
  "bank",
  "other",
];

export type SavingsGoalStatus = "active" | "completed" | "archived";

export interface FinanceTransaction {
  _id: string;
  user: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note: string;
  source: TransactionSource | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceBudget {
  _id: string;
  user: string;
  month: string;
  category: string | null;
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  _id: string;
  user: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  status: SavingsGoalStatus;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface BudgetUsageEntry {
  _id: string;
  category: string;
  limit: number;
  used: number;
  remaining: number;
  percent: number;
}

export interface OverallBudgetUsage {
  limit: number;
  used: number;
  remaining: number;
  percent: number;
}

export interface FinanceSummary {
  month: string;
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  expensesByCategory: CategoryBreakdown[];
  recentTransactions: FinanceTransaction[];
  budgets: {
    overall: OverallBudgetUsage | null;
    byCategory: BudgetUsageEntry[];
  };
  activeGoals: SavingsGoal[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  source?: TransactionSource | null;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category?: string;
  date?: string;
  note?: string;
  source?: TransactionSource | null;
}

export interface ListTransactionsFilters {
  month?: string;
  type?: TransactionType;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateBudgetInput {
  month: string;
  category: string | null;
  limitAmount: number;
}

export interface UpdateBudgetInput {
  month?: string;
  category?: string | null;
  limitAmount?: number;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string | null;
  status?: SavingsGoalStatus;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string | null;
  status?: SavingsGoalStatus;
}

export const EXPENSE_CATEGORY_SUGGESTIONS = [
  "food",
  "transport",
  "rent",
  "utilities",
  "groceries",
  "shopping",
  "entertainment",
  "health",
  "education",
  "subscriptions",
  "travel",
  "other",
];

export const INCOME_CATEGORY_SUGGESTIONS = [
  "salary",
  "freelance",
  "investment",
  "business",
  "gift",
  "refund",
  "other",
];

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string): string {
  const [yearStr, monthStr] = month.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function shiftMonth(month: string, delta: number): string {
  const [yearStr, monthStr] = month.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(value: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
