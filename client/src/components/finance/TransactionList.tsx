import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, type FinanceTransaction } from "@/types/finance";
import { cn } from "@/lib/utils";

interface Props {
  transactions: FinanceTransaction[];
  currency?: string;
  onEdit?: (transaction: FinanceTransaction) => void;
  onDelete?: (transaction: FinanceTransaction) => void;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  currency = "INR",
  onEdit,
  onDelete,
  emptyMessage = "No transactions yet.",
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {transactions.map((tx) => {
        const isIncome = tx.type === "income";
        const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
        const tone = isIncome
          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          : "text-rose-600 dark:text-rose-400 bg-rose-500/10";
        return (
          <li key={tx._id} className="flex items-center gap-3 px-4 py-3">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", tone)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize truncate">{tx.category}</span>
                {tx.source && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tx.source}
                  </span>
                )}
              </div>
              {tx.note && (
                <p className="truncate text-xs text-muted-foreground">{tx.note}</p>
              )}
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                )}
              >
                {isIncome ? "+" : "−"}
                {formatCurrency(tx.amount, currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(tx.date).toLocaleDateString()}
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className="ml-2 flex items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(tx)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Edit transaction"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(tx)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
