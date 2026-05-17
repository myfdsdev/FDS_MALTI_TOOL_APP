import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  CreateBudgetInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  FinanceBudget,
  FinanceSummary,
  FinanceTransaction,
  ListTransactionsFilters,
  PaginatedResult,
  SavingsGoal,
  UpdateBudgetInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from "@/types/finance";

export async function getSummary(month?: string) {
  const response = await api.get<ApiSuccess<FinanceSummary>>("/finance/summary", {
    params: month ? { month } : undefined,
  });
  return response.data.data;
}

export async function listTransactions(filters?: ListTransactionsFilters) {
  const response = await api.get<ApiSuccess<PaginatedResult<FinanceTransaction>>>(
    "/finance/transactions",
    { params: filters }
  );
  return response.data.data;
}

export async function createTransaction(input: CreateTransactionInput) {
  const response = await api.post<ApiSuccess<FinanceTransaction>>("/finance/transactions", input);
  return response.data.data;
}

export async function updateTransaction(id: string, input: UpdateTransactionInput) {
  const response = await api.patch<ApiSuccess<FinanceTransaction>>(
    `/finance/transactions/${id}`,
    input
  );
  return response.data.data;
}

export async function deleteTransaction(id: string) {
  await api.delete(`/finance/transactions/${id}`);
}

export async function listBudgets(month?: string) {
  const response = await api.get<ApiSuccess<FinanceBudget[]>>("/finance/budgets", {
    params: month ? { month } : undefined,
  });
  return response.data.data;
}

export async function createBudget(input: CreateBudgetInput) {
  const response = await api.post<ApiSuccess<FinanceBudget>>("/finance/budgets", input);
  return response.data.data;
}

export async function updateBudget(id: string, input: UpdateBudgetInput) {
  const response = await api.patch<ApiSuccess<FinanceBudget>>(`/finance/budgets/${id}`, input);
  return response.data.data;
}

export async function deleteBudget(id: string) {
  await api.delete(`/finance/budgets/${id}`);
}

export async function listSavingsGoals() {
  const response = await api.get<ApiSuccess<SavingsGoal[]>>("/finance/savings-goals");
  return response.data.data;
}

export async function createSavingsGoal(input: CreateSavingsGoalInput) {
  const response = await api.post<ApiSuccess<SavingsGoal>>("/finance/savings-goals", input);
  return response.data.data;
}

export async function updateSavingsGoal(id: string, input: UpdateSavingsGoalInput) {
  const response = await api.patch<ApiSuccess<SavingsGoal>>(
    `/finance/savings-goals/${id}`,
    input
  );
  return response.data.data;
}

export async function deleteSavingsGoal(id: string) {
  await api.delete(`/finance/savings-goals/${id}`);
}
