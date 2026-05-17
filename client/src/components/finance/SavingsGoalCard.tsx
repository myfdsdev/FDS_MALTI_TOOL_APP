import { Pencil, Target, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type SavingsGoal } from "@/types/finance";
import { cn } from "@/lib/utils";

interface Props {
  goal: SavingsGoal;
  currency?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

function monthsRemaining(goal: SavingsGoal): number | null {
  if (!goal.targetDate) return null;
  const target = new Date(goal.targetDate).getTime();
  const now = Date.now();
  const months = Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24 * 30)));
  return months;
}

export function SavingsGoalCard({ goal, currency = "INR", onEdit, onDelete }: Props) {
  const completed = goal.status === "completed" || goal.currentAmount >= goal.targetAmount;
  const months = monthsRemaining(goal);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                completed
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              <Target className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{goal.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(goal.currentAmount, currency)} /{" "}
                {formatCurrency(goal.targetAmount, currency)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Edit goal"
              >
                <Pencil className="size-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete goal"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-[width] duration-300",
              completed ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="tabular-nums font-medium text-foreground">{goal.progressPercent}%</span>
          {goal.targetDate && (
            <span className="text-muted-foreground">
              {completed
                ? "Goal reached"
                : months === 0
                  ? "Due this month"
                  : `${months} month${months === 1 ? "" : "s"} left`}
            </span>
          )}
          {!goal.targetDate && (
            <span className="text-muted-foreground capitalize">{goal.status}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
