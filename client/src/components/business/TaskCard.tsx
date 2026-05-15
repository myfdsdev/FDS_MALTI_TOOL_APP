import { motion, useReducedMotion } from "motion/react";
import { format } from "date-fns";
import { MessageSquareText, Paperclip, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/business";
import { PriorityBadge } from "./PriorityBadge";
import { StatusPill } from "./StatusPill";

export function TaskCard({
  task,
  onClick,
  className,
  showStatus = false,
  overdue = false,
}: {
  task: Task;
  onClick?: () => void;
  className?: string;
  showStatus?: boolean;
  overdue?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const checklistDone = task.checklist.filter((item) => item.done).length;

  return (
    <motion.button
      type="button"
      layout
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -1 }}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
        overdue && "border-l-4 border-l-destructive",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold">{task.title}</p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {showStatus && <StatusPill status={task.status} />}
        {task.dueDate && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckSquare className="size-3.5" />
          {checklistDone}/{task.checklist.length}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquareText className="size-3.5" />
          {task.description ? "Notes" : "Blank"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Paperclip className="size-3.5" />
          {task.progress}%
        </span>
      </div>
    </motion.button>
  );
}
