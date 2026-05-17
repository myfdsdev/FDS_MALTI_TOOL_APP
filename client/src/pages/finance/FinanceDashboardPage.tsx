import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Plus, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FinanceSummaryCards } from "@/components/finance/FinanceSummaryCards";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { TransactionList } from "@/components/finance/TransactionList";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { SavingsGoalCard } from "@/components/finance/SavingsGoalCard";
import {
  TransactionDialog,
  type TransactionDialogValues,
} from "@/components/finance/TransactionDialog";
import {
  useCreateTransaction,
  useFinanceSummary,
} from "@/lib/finance.queries";
import { extractErrorMessage } from "@/lib/api";
import { currentMonthKey, formatCurrency } from "@/types/finance";

export default function FinanceDashboardPage() {
  const [month, setMonth] = React.useState<string>(currentMonthKey());
  const { data: summary, isLoading } = useFinanceSummary(month);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const createTransaction = useCreateTransaction();

  async function handleCreate(values: TransactionDialogValues) {
    try {
      await createTransaction.mutateAsync({
        type: values.type,
        amount: Number(values.amount),
        category: values.category,
        date: new Date(values.date).toISOString(),
        note: values.note,
        source: values.source ? values.source : null,
      });
      toast.success("Transaction added");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't add that transaction"));
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Wallet className="size-3.5 text-primary" />
            Personal finance
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Finance dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track every rupee in and out, plan budgets, and stay on top of your savings goals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector month={month} onChange={setMonth} />
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add transaction
          </Button>
        </div>
      </header>

      <section className="mt-8">
        <FinanceSummaryCards
          income={summary?.income ?? 0}
          expenses={summary?.expenses ?? 0}
          net={summary?.net ?? 0}
          transactionCount={summary?.transactionCount ?? 0}
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3">
          <SectionHeader
            title="Recent activity"
            action={
              <Link
                to="/finance/transactions"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <TransactionList
            transactions={summary?.recentTransactions ?? []}
            emptyMessage={
              isLoading ? "Loading..." : "No transactions yet — add your first one above."
            }
          />
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Top spending categories"
            hint={summary ? `${summary.expensesByCategory.length} categories` : undefined}
          />
          <Card>
            <CardContent className="space-y-2 p-4">
              {summary && summary.expensesByCategory.length > 0 ? (
                summary.expensesByCategory.slice(0, 6).map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{c.category}</span>
                    <span className="tabular-nums font-medium">{formatCurrency(c.total)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No expenses recorded this month yet.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHeader
            title="Budgets"
            action={
              <Link
                to="/finance/budgets"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Manage <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="space-y-3">
            {summary?.budgets.overall && (
              <BudgetCard
                label="Overall monthly budget"
                limit={summary.budgets.overall.limit}
                used={summary.budgets.overall.used}
                remaining={summary.budgets.overall.remaining}
                percent={summary.budgets.overall.percent}
              />
            )}
            {summary?.budgets.byCategory.slice(0, 3).map((b) => (
              <BudgetCard
                key={b._id}
                label={b.category}
                limit={b.limit}
                used={b.used}
                remaining={b.remaining}
                percent={b.percent}
              />
            ))}
            {!summary?.budgets.overall && summary?.budgets.byCategory.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No budgets set for this month yet.
                  <div className="mt-3">
                    <Link
                      to="/finance/budgets"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent"
                    >
                      Create a budget
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Active savings goals"
            action={
              <Link
                to="/finance/savings-goals"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Manage <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="space-y-3">
            {summary && summary.activeGoals.length > 0 ? (
              summary.activeGoals.map((g) => <SavingsGoalCard key={g._id} goal={g} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                  <Target className="size-5" />
                  No active goals.
                  <Link
                    to="/finance/savings-goals"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent"
                  >
                    Set a goal
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isPending={createTransaction.isPending}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
