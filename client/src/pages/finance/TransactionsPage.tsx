import * as React from "react";
import { toast } from "sonner";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MonthSelector } from "@/components/finance/MonthSelector";
import { TransactionList } from "@/components/finance/TransactionList";
import {
  TransactionDialog,
  type TransactionDialogValues,
} from "@/components/finance/TransactionDialog";
import {
  useCreateTransaction,
  useDeleteTransactionById,
  useListTransactions,
  useUpdateTransactionById,
} from "@/lib/finance.queries";
import { extractErrorMessage } from "@/lib/api";
import { currentMonthKey, type FinanceTransaction, type TransactionType } from "@/types/finance";

export default function TransactionsPage() {
  const [month, setMonth] = React.useState<string>(currentMonthKey());
  const [typeFilter, setTypeFilter] = React.useState<"all" | TransactionType>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FinanceTransaction | null>(null);

  const { data, isLoading } = useListTransactions({
    month,
    type: typeFilter === "all" ? undefined : typeFilter,
    limit: 200,
  });

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransactionById();
  const deleteTransaction = useDeleteTransactionById();

  async function handleSubmit(values: TransactionDialogValues) {
    const payload = {
      type: values.type,
      amount: Number(values.amount),
      category: values.category,
      date: new Date(values.date).toISOString(),
      note: values.note,
      source: values.source ? values.source : null,
    };
    try {
      if (editing) {
        await updateTransaction.mutateAsync({ id: editing._id, input: payload });
        toast.success("Transaction updated");
        setEditing(null);
      } else {
        await createTransaction.mutateAsync(payload);
        toast.success("Transaction added");
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save that transaction"));
      throw error;
    }
  }

  async function handleDelete(tx: FinanceTransaction) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction.mutateAsync(tx._id);
      toast.success("Transaction deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete that transaction"));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Receipt className="size-3.5 text-primary" />
            Transactions
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">All transactions</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review, edit and delete every expense or income entry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSelector month={month} onChange={setMonth} />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="w-32"
          >
            <option value="all">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </Select>
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            New
          </Button>
        </div>
      </header>

      <section className="mt-6">
        <TransactionList
          transactions={data?.items ?? []}
          onEdit={(tx) => {
            setEditing(tx);
            setDialogOpen(true);
          }}
          onDelete={(tx) => void handleDelete(tx)}
          emptyMessage={isLoading ? "Loading..." : "Nothing for this month yet."}
        />
      </section>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? "Edit transaction" : "New transaction"}
        isPending={createTransaction.isPending || updateTransaction.isPending}
        defaultValues={
          editing
            ? {
                type: editing.type,
                amount: editing.amount,
                category: editing.category,
                date: editing.date.slice(0, 10),
                note: editing.note,
                source: editing.source ?? "",
              }
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
