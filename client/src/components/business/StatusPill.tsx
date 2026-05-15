import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/business";

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export function StatusPill({
  status,
  pulse = false,
  className,
}: {
  status: TaskStatus;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.04, 1] } : undefined}
      transition={pulse ? { duration: 0.24, ease: "easeOut" } : undefined}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </motion.span>
  );
}
