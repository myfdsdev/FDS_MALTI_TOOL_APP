import * as React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PiggyBank, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { MonthSelector } from "@/components/finance/MonthSelector";
import {
  useCreateBudget,
  useFinanceSummary,
  useListBudgets,
} from "@/lib/finance.queries";
import { deleteBudget, updateBudget } from "@/lib/finance.api";
import { useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/lib/finance.queries";
import { useAuthStore } from "@/stores/auth.store";
import { extractErrorMessage } from "@/lib/api";
import {
  currentMonthKey,
  EXPENSE_CATEGORY_SUGGESTIONS,
  formatCurrency,
  formatMonthLabel,
  type FinanceBudget,
} from "@/types/finance";

const budgetFormSchema = z.object({
  scope: z.enum(["overall", "category"]),
  category: z.string().trim().max(60).optional().default(""),
  limitAmount: z.coerce.number().positive("Limit must be greater than 0"),
});
type BudgetFormInput = z.input<typeof budgetFormSchema>;
type BudgetFormValues = z.output<typeof budgetFormSchema>;

export default function BudgetsPage() {
  const [month, setMonth] = React.useState<string>(currentMonthKey());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FinanceBudget | null>(null);

  const { data: budgets = [] } = useListBudgets(month);
  const { data: summary } = useFinanceSummary(month);
  const createBudget = useCreateBudget();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const overall = budgets.find((b) => b.category === null);
  const categoryBudgets = budgets.filter((b) => b.category !== null);

  const categorySpendMap = React.useMemo(() => {
    const m = new Map<string, number>();
    summary?.expensesByCategory.forEach((c) => m.set(c.category, c.total));
    return m;
  }, [summary]);

  async function handleSave(values: BudgetFormValues) {
    const payload = {
      month,
      category: values.scope === "overall" ? null : values.category.trim().toLowerCase(),
      limitAmount: Number(values.limitAmount),
    };
    if (!editing && payload.category === "") {
      // overall (already null) is fine; for category scope require a non-empty value
    }
    if (values.scope === "category" && !payload.category) {
      toast.error("Pick a category for category-level budgets");
      throw new Error("missing category");
    }
    try {
      if (editing) {
        await updateBudget(editing._id, payload);
        toast.success("Budget updated");
      } else {
        await createBudget.mutateAsync(payload);
        toast.success("Budget created");
      }
      queryClient.invalidateQueries({ queryKey: financeKeys.all(userId) });
      setEditing(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save that budget"));
      throw error;
    }
  }

  async function handleDelete(budget: FinanceBudget) {
    if (!window.confirm("Delete this budget?")) return;
    try {
      await deleteBudget(budget._id);
      queryClient.invalidateQueries({ queryKey: financeKeys.all(userId) });
      toast.success("Budget deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete that budget"));
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(budget: FinanceBudget) {
    setEditing(budget);
    setDialogOpen(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <PiggyBank className="size-3.5 text-primary" />
            Budgets
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Budgets for {formatMonthLabel(month)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Plan how much to spend per category each month. Budgets reset every month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector month={month} onChange={setMonth} />
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            New budget
          </Button>
        </div>
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-bold tracking-tight">Overall monthly budget</h2>
        {overall ? (
          <BudgetCard
            label="Overall"
            limit={overall.limitAmount}
            used={summary?.expenses ?? 0}
            remaining={overall.limitAmount - (summary?.expenses ?? 0)}
            percent={
              overall.limitAmount
                ? Math.min(100, Math.round(((summary?.expenses ?? 0) / overall.limitAmount) * 100))
                : 0
            }
            onEdit={() => openEdit(overall)}
            onDelete={() => void handleDelete(overall)}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No overall budget set yet for {formatMonthLabel(month)}.{" "}
              <button type="button" onClick={openCreate} className="text-primary hover:underline">
                Create one
              </button>
              .
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-bold tracking-tight">Category budgets</h2>
        {categoryBudgets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {categoryBudgets.map((b) => {
              const used = categorySpendMap.get(b.category!) ?? 0;
              return (
                <BudgetCard
                  key={b._id}
                  label={b.category!}
                  limit={b.limitAmount}
                  used={used}
                  remaining={b.limitAmount - used}
                  percent={
                    b.limitAmount ? Math.min(100, Math.round((used / b.limitAmount) * 100)) : 0
                  }
                  onEdit={() => openEdit(b)}
                  onDelete={() => void handleDelete(b)}
                />
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No category budgets yet.
            </CardContent>
          </Card>
        )}
      </section>

      {summary && summary.expensesByCategory.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold tracking-tight">This month's spending by category</h2>
          <Card>
            <CardContent className="space-y-2 p-4">
              {summary.expensesByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{c.category}</span>
                  <span className="tabular-nums font-medium">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        isPending={createBudget.isPending}
        onSubmit={handleSave}
      />
    </div>
  );
}

function BudgetDialog({
  open,
  onOpenChange,
  editing,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: FinanceBudget | null;
  isPending: boolean;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}) {
  const form = useForm<BudgetFormInput, unknown, BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      scope: "category",
      category: "",
      limitAmount: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      scope: editing ? (editing.category ? "category" : "overall") : "category",
      category: editing?.category ?? "",
      limitAmount: editing?.limitAmount ?? "",
    });
  }, [editing, form, open]);

  const scope = form.watch("scope");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit budget" : "New budget"}</DialogTitle>
          <DialogDescription>
            Set a monthly limit for a single category, or for total spending.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          })}
          className="space-y-4 px-6 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="budget-scope">Scope</Label>
            <Select id="budget-scope" {...form.register("scope")}>
              <option value="category">Single category</option>
              <option value="overall">Overall monthly limit</option>
            </Select>
          </div>

          {scope === "category" && (
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Input
                id="budget-category"
                list="finance-category-suggestions-budget"
                placeholder="e.g. food"
                {...form.register("category")}
              />
              <datalist id="finance-category-suggestions-budget">
                {EXPENSE_CATEGORY_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="budget-limit">Monthly limit</Label>
            <Input
              id="budget-limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("limitAmount", { valueAsNumber: true })}
            />
            {form.formState.errors.limitAmount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.limitAmount.message}
              </p>
            )}
          </div>

          <DialogFooter className="px-0 pb-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
