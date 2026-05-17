import type { Request, Response } from "express";
import { isValidObjectId, type Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/responses.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors.js";
import { FinanceTransaction } from "../models/FinanceTransaction.model.js";
import { FinanceBudget } from "../models/FinanceBudget.model.js";
import { SavingsGoal } from "../models/SavingsGoal.model.js";
import type {
  CreateBudgetInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  ListBudgetsQueryInput,
  ListTransactionsQueryInput,
  SummaryQueryInput,
  UpdateBudgetInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from "../validators/finance.validator.js";

type UserRequest = Request & { user: NonNullable<Request["user"]> };

function requireUser(req: Request): UserRequest {
  if (!req.user) throw new UnauthorizedError();
  return req as UserRequest;
}

function ensureObjectId(id: string, label: string): void {
  if (!isValidObjectId(id)) {
    throw new NotFoundError(`${label} not found`);
  }
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(month: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
  return { start, end };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

async function findOwnedTransactionOr404(userId: Types.ObjectId, id: string) {
  ensureObjectId(id, "Transaction");
  const tx = await FinanceTransaction.findOne({ _id: id, user: userId });
  if (!tx) throw new NotFoundError("Transaction not found");
  return tx;
}

async function findOwnedBudgetOr404(userId: Types.ObjectId, id: string) {
  ensureObjectId(id, "Budget");
  const budget = await FinanceBudget.findOne({ _id: id, user: userId });
  if (!budget) throw new NotFoundError("Budget not found");
  return budget;
}

async function findOwnedSavingsGoalOr404(userId: Types.ObjectId, id: string) {
  ensureObjectId(id, "Savings goal");
  const goal = await SavingsGoal.findOne({ _id: id, user: userId });
  if (!goal) throw new NotFoundError("Savings goal not found");
  return goal;
}

/* ============================== TRANSACTIONS ============================== */

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { month, type, category, page, limit } = req.query as unknown as ListTransactionsQueryInput;

  const filter: Record<string, unknown> = { user: authedReq.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();
  if (month) {
    const { start, end } = monthRange(month);
    filter.date = { $gte: start, $lt: end };
  }

  const [items, total] = await Promise.all([
    FinanceTransaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    FinanceTransaction.countDocuments(filter),
  ]);

  return ok(res, {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateTransactionInput;

  const tx = await FinanceTransaction.create({
    user: authedReq.user._id,
    type: input.type,
    amount: round2(input.amount),
    category: input.category.trim().toLowerCase(),
    date: input.date,
    note: input.note ?? "",
    source: input.source ?? null,
  });

  return created(res, tx, "Transaction created");
});

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const tx = await findOwnedTransactionOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateTransactionInput;

  if (input.type !== undefined) tx.type = input.type;
  if (input.amount !== undefined) tx.amount = round2(input.amount);
  if (input.category !== undefined) tx.category = input.category.trim().toLowerCase();
  if (input.date !== undefined) tx.date = input.date;
  if (input.note !== undefined) tx.note = input.note;
  if (input.source !== undefined) tx.source = input.source;

  await tx.save();
  return ok(res, tx, "Transaction updated");
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const tx = await findOwnedTransactionOr404(authedReq.user._id, req.params.id);
  await FinanceTransaction.deleteOne({ _id: tx._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Transaction deleted");
});

/* ============================== SUMMARY ============================== */

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { month } = req.query as unknown as SummaryQueryInput;
  const targetMonth = month ?? currentMonth();
  const { start, end } = monthRange(targetMonth);

  const userId = authedReq.user._id;

  const [aggregate, byCategory, recent, budgets, goals] = await Promise.all([
    FinanceTransaction.aggregate<{ _id: "income" | "expense"; total: number; count: number }>([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    FinanceTransaction.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { user: userId, type: "expense", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    FinanceTransaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .lean(),
    FinanceBudget.find({ user: userId, month: targetMonth }).lean(),
    SavingsGoal.find({ user: userId, status: "active" }).sort({ updatedAt: -1 }).limit(4).lean(),
  ]);

  const income = round2(aggregate.find((a) => a._id === "income")?.total ?? 0);
  const expenses = round2(aggregate.find((a) => a._id === "expense")?.total ?? 0);
  const net = round2(income - expenses);

  // Build budget usage from category totals.
  const expensesByCategory = new Map<string, number>();
  for (const c of byCategory) {
    expensesByCategory.set(c._id, c.total);
  }
  const totalBudget = budgets.find((b) => b.category === null);
  const categoryBudgets = budgets.filter((b) => b.category !== null);

  const budgetUsage = {
    overall: totalBudget
      ? {
          limit: round2(totalBudget.limitAmount),
          used: expenses,
          remaining: round2(totalBudget.limitAmount - expenses),
          percent: totalBudget.limitAmount
            ? Math.min(100, Math.round((expenses / totalBudget.limitAmount) * 100))
            : 0,
        }
      : null,
    byCategory: categoryBudgets.map((b) => {
      const used = round2(expensesByCategory.get(b.category!) ?? 0);
      return {
        _id: String(b._id),
        category: b.category,
        limit: round2(b.limitAmount),
        used,
        remaining: round2(b.limitAmount - used),
        percent: b.limitAmount ? Math.min(100, Math.round((used / b.limitAmount) * 100)) : 0,
      };
    }),
  };

  return ok(res, {
    month: targetMonth,
    income,
    expenses,
    net,
    transactionCount:
      (aggregate.find((a) => a._id === "income")?.count ?? 0) +
      (aggregate.find((a) => a._id === "expense")?.count ?? 0),
    expensesByCategory: byCategory.map((c) => ({
      category: c._id,
      total: round2(c.total),
      count: c.count,
    })),
    recentTransactions: recent,
    budgets: budgetUsage,
    activeGoals: goals.map((g) => ({
      ...g,
      progressPercent: g.targetAmount
        ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
        : 0,
    })),
  });
});

/* ============================== BUDGETS ============================== */

export const listBudgets = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const { month } = req.query as unknown as ListBudgetsQueryInput;
  const filter: Record<string, unknown> = { user: authedReq.user._id };
  if (month) filter.month = month;

  const budgets = await FinanceBudget.find(filter).sort({ month: -1, category: 1 }).lean();
  return ok(res, budgets);
});

export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateBudgetInput;
  const category = input.category ? input.category.trim().toLowerCase() : null;

  try {
    const budget = await FinanceBudget.create({
      user: authedReq.user._id,
      month: input.month,
      category,
      limitAmount: round2(input.limitAmount),
    });
    return created(res, budget, "Budget created");
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      throw new ConflictError(
        category
          ? `A budget for "${category}" in ${input.month} already exists`
          : `An overall budget for ${input.month} already exists`
      );
    }
    throw err;
  }
});

export const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const budget = await findOwnedBudgetOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateBudgetInput;

  if (input.month !== undefined) budget.month = input.month;
  if (input.category !== undefined) {
    budget.category = input.category ? input.category.trim().toLowerCase() : null;
  }
  if (input.limitAmount !== undefined) budget.limitAmount = round2(input.limitAmount);

  try {
    await budget.save();
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      throw new ConflictError("A budget for this month and category already exists");
    }
    throw err;
  }

  return ok(res, budget, "Budget updated");
});

export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const budget = await findOwnedBudgetOr404(authedReq.user._id, req.params.id);
  await FinanceBudget.deleteOne({ _id: budget._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Budget deleted");
});

/* ============================== SAVINGS GOALS ============================== */

function serializeGoal(goal: { targetAmount: number; currentAmount: number } & Record<string, unknown>) {
  return {
    ...goal,
    progressPercent: goal.targetAmount
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      : 0,
  };
}

export const listSavingsGoals = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const goals = await SavingsGoal.find({ user: authedReq.user._id })
    .sort({ status: 1, updatedAt: -1 })
    .lean();
  return ok(res, goals.map((g) => serializeGoal(g)));
});

export const createSavingsGoal = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const input = req.body as CreateSavingsGoalInput;

  if (input.currentAmount > input.targetAmount) {
    throw new BadRequestError("Current amount cannot exceed target amount");
  }

  const goal = await SavingsGoal.create({
    user: authedReq.user._id,
    name: input.name.trim(),
    targetAmount: round2(input.targetAmount),
    currentAmount: round2(input.currentAmount),
    targetDate: input.targetDate,
    status: input.status,
  });

  return created(res, serializeGoal(goal.toObject()), "Savings goal created");
});

export const updateSavingsGoal = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const goal = await findOwnedSavingsGoalOr404(authedReq.user._id, req.params.id);
  const input = req.body as UpdateSavingsGoalInput;

  if (input.name !== undefined) goal.name = input.name.trim();
  if (input.targetAmount !== undefined) goal.targetAmount = round2(input.targetAmount);
  if (input.currentAmount !== undefined) goal.currentAmount = round2(input.currentAmount);
  if (input.targetDate !== undefined) goal.targetDate = input.targetDate;
  if (input.status !== undefined) goal.status = input.status;

  if (goal.currentAmount > goal.targetAmount) {
    throw new BadRequestError("Current amount cannot exceed target amount");
  }

  if (goal.currentAmount >= goal.targetAmount && goal.status === "active") {
    goal.status = "completed";
  }

  await goal.save();
  return ok(res, serializeGoal(goal.toObject()), "Savings goal updated");
});

export const deleteSavingsGoal = asyncHandler(async (req: Request, res: Response) => {
  const authedReq = requireUser(req);
  const goal = await findOwnedSavingsGoalOr404(authedReq.user._id, req.params.id);
  await SavingsGoal.deleteOne({ _id: goal._id, user: authedReq.user._id });
  return ok(res, { deleted: true }, "Savings goal deleted");
});
