import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/types/finance";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  limit: number;
  used: number;
  remaining: number;
  percent: number;
  currency?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BudgetCard({
  label,
  limit,
  used,
  remaining,
  percent,
  currency = "INR",
  onEdit,
  onDelete,
}: Props) {
  const over = remaining < 0;
  const near = !over && percent >= 80;
  const barTone = over
    ? "bg-rose-500"
    : near
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-medium capitalize">{label}</div>
            <div className="text-xs text-muted-foreground">
              Limit {formatCurrency(limit, currency)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Edit budget"
              >
                <Pencil className="size-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete budget"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-[width] duration-300", barTone)}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Used <span className="font-medium tabular-nums text-foreground">{formatCurrency(used, currency)}</span>
          </span>
          <span
            className={cn(
              "tabular-nums font-medium",
              over ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
            )}
          >
            {over
              ? `Over by ${formatCurrency(-remaining, currency)}`
              : `${formatCurrency(remaining, currency)} left`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
