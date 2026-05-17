import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceEnabled } from "../middleware/featureFlag.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createBudgetSchema,
  createSavingsGoalSchema,
  createTransactionSchema,
  listBudgetsQuerySchema,
  listTransactionsQuerySchema,
  summaryQuerySchema,
  updateBudgetSchema,
  updateSavingsGoalSchema,
  updateTransactionSchema,
} from "../validators/finance.validator.js";
import {
  createBudget,
  createSavingsGoal,
  createTransaction,
  deleteBudget,
  deleteSavingsGoal,
  deleteTransaction,
  getSummary,
  listBudgets,
  listSavingsGoals,
  listTransactions,
  updateBudget,
  updateSavingsGoal,
  updateTransaction,
} from "../controllers/finance.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireWorkspaceEnabled("finance"));

// Summary
router.get("/summary", validate(summaryQuerySchema, "query"), getSummary);

// Transactions
router.get("/transactions", validate(listTransactionsQuerySchema, "query"), listTransactions);
router.post("/transactions", validate(createTransactionSchema), createTransaction);
router.patch("/transactions/:id", validate(updateTransactionSchema), updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

// Budgets
router.get("/budgets", validate(listBudgetsQuerySchema, "query"), listBudgets);
router.post("/budgets", validate(createBudgetSchema), createBudget);
router.patch("/budgets/:id", validate(updateBudgetSchema), updateBudget);
router.delete("/budgets/:id", deleteBudget);

// Savings goals
router.get("/savings-goals", listSavingsGoals);
router.post("/savings-goals", validate(createSavingsGoalSchema), createSavingsGoal);
router.patch("/savings-goals/:id", validate(updateSavingsGoalSchema), updateSavingsGoal);
router.delete("/savings-goals/:id", deleteSavingsGoal);

export default router;
