import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as financeApi from "./finance.api";
import { scopeKey } from "@/lib/query-scope";
import { useAuthStore } from "@/stores/auth.store";
import type {
  CreateBudgetInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  ListTransactionsFilters,
  UpdateBudgetInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from "@/types/finance";

export const financeKeys = {
  all: (userId?: string | null) => ["finance", scopeKey(userId)] as const,
  summary: (userId: string | null | undefined, month?: string) =>
    [...financeKeys.all(userId), "summary", month ?? "current"] as const,
  transactions: (userId?: string | null) =>
    [...financeKeys.all(userId), "transactions"] as const,
  transactionList: (userId: string | null | undefined, filters?: ListTransactionsFilters) =>
    [...financeKeys.transactions(userId), "list", filters ?? {}] as const,
  budgets: (userId?: string | null) => [...financeKeys.all(userId), "budgets"] as const,
  budgetList: (userId: string | null | undefined, month?: string) =>
    [...financeKeys.budgets(userId), "list", month ?? "all"] as const,
  goals: (userId?: string | null) => [...financeKeys.all(userId), "goals"] as const,
};

export function useFinanceSummary(month?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: financeKeys.summary(userId, month),
    queryFn: () => financeApi.getSummary(month),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useListTransactions(filters?: ListTransactionsFilters) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: financeKeys.transactionList(userId, filters),
    queryFn: () => financeApi.listTransactions(filters),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

function useInvalidateFinance() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return () => {
    queryClient.invalidateQueries({ queryKey: financeKeys.all(userId) });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => financeApi.createTransaction(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateTransaction(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => financeApi.updateTransaction(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteTransaction(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: () => financeApi.deleteTransaction(id),
    onSuccess: () => invalidate(),
  });
}

/** Variant that accepts the transaction id at mutate time — handy for list rows. */
export function useDeleteTransactionById() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => invalidate(),
  });
}

/** Variant of update mutation that takes the id at call time. */
export function useUpdateTransactionById() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof financeApi.updateTransaction>[1] }) =>
      financeApi.updateTransaction(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useListBudgets(month?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: financeKeys.budgetList(userId, month),
    queryFn: () => financeApi.listBudgets(month),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useCreateBudget() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => financeApi.createBudget(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateBudget(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: UpdateBudgetInput) => financeApi.updateBudget(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteBudget(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: () => financeApi.deleteBudget(id),
    onSuccess: () => invalidate(),
  });
}

export function useListSavingsGoals() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: financeKeys.goals(userId),
    queryFn: () => financeApi.listSavingsGoals(),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useCreateSavingsGoal() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: CreateSavingsGoalInput) => financeApi.createSavingsGoal(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateSavingsGoal(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: (input: UpdateSavingsGoalInput) => financeApi.updateSavingsGoal(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSavingsGoal(id: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: () => financeApi.deleteSavingsGoal(id),
    onSuccess: () => invalidate(),
  });
}
