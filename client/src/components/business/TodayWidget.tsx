import { AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { format, isBefore, startOfToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/types/business";
import { getTaskProjectId, getTaskProjectMeta } from "@/types/business";
import { PriorityBadge } from "./PriorityBadge";

export function TodayWidget({
  tasks,
  limit = 5,
  showViewAll = true,
}: {
  tasks: Task[];
  limit?: number;
  showViewAll?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const visibleTasks = tasks.slice(0, limit);

  if (tasks.length === 0) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="flex items-start gap-4 p-6">
          <CheckCircle2 className="mt-1 size-6 text-emerald-600" />
          <div>
            <p className="text-lg font-semibold">All clear for today</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There are no overdue or due-today tasks right now.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <CardTitle className="text-base">Due today</CardTitle>
        </div>
        {showViewAll && (
          <Link to="/business/projects#today-list" className="text-xs font-medium text-primary hover:underline">
            View today
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleTasks.map((task, index) => {
          const project = getTaskProjectMeta(task);
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const overdue = Boolean(dueDate && isBefore(dueDate, startOfToday()));

          return (
            <motion.button
              key={task._id}
              type="button"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : index * 0.04 }}
              onClick={() =>
                navigate(`/business/projects/${getTaskProjectId(task)}?taskId=${task._id}`)
              }
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:bg-accent"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full ${
                  overdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}
              >
                {overdue ? <AlertCircle className="size-4" /> : <CalendarClock className="size-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {project && (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                        aria-hidden="true"
                      />
                      {project.name}
                    </span>
                  )}
                  {dueDate && <span>{format(dueDate, "MMM d · h:mm a")}</span>}
                </div>
              </div>

              <PriorityBadge priority={task.priority} />
            </motion.button>
          );
        })}

        {tasks.length > limit && (
          <p className="text-xs text-muted-foreground">
            Showing {limit} of {tasks.length} due-today tasks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
