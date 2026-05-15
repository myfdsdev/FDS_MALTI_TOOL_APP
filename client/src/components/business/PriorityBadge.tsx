import type { TaskPriority } from "@/types/business";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const DOT_STYLES: Record<TaskPriority, string> = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        PRIORITY_STYLES[priority],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_STYLES[priority])} />
      {priority.replace("_", " ")}
    </span>
  );
}
