import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task } from "@/types/business";
import { PriorityBadge } from "../PriorityBadge";

export function CalendarView({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const [month, setMonth] = React.useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());

  const days = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
      }),
    [month]
  );

  const grouped = React.useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
      if (!task.dueDate) return acc;
      const key = format(new Date(task.dueDate), "yyyy-MM-dd");
      acc[key] ??= [];
      acc[key].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const selectedTasks = selectedDate ? grouped[format(selectedDate, "yyyy-MM-dd")] ?? [] : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <p className="text-lg font-semibold">{format(month, "MMMM yyyy")}</p>
            <p className="text-sm text-muted-foreground">Tasks are pinned to their due dates.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth((current) => subMonths(current, 1))}
              className="rounded-md p-2 hover:bg-accent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const today = startOfMonth(new Date());
                setMonth(today);
                setSelectedDate(new Date());
              }}
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              className="rounded-md p-2 hover:bg-accent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-2 py-3">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = grouped[key] ?? [];
            const active = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`min-h-32 border-b border-r border-border px-2 py-2 text-left align-top transition-colors last:border-r-0 ${
                  active ? "bg-primary/5" : "hover:bg-accent/40"
                } ${!isSameMonth(day, month) ? "bg-muted/35 text-muted-foreground" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const overdue =
                      task.status !== "done" &&
                      task.dueDate &&
                      isBefore(new Date(task.dueDate), startOfToday());

                    return (
                      <div
                        key={task._id}
                        className={`rounded-md px-2 py-1 text-xs ${
                          overdue ? "border-l-2 border-l-destructive bg-destructive/5" : "bg-muted"
                        }`}
                      >
                        <div className="truncate font-medium">{task.title}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`size-2 rounded-full ${
                              task.priority === "urgent"
                                ? "bg-red-500"
                                : task.priority === "high"
                                  ? "bg-amber-500"
                                  : task.priority === "medium"
                                    ? "bg-blue-500"
                                    : "bg-slate-500"
                            }`}
                          />
                          <span className="truncate text-[11px] text-muted-foreground">
                            {task.dueDate ? format(new Date(task.dueDate), "h:mm a") : "No time"}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">+ {dayTasks.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">
          {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Select a day"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click a task to open it. Drag-to-reschedule can be added in a follow-up.
        </p>

        <div className="mt-4 space-y-3">
          {selectedTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
              No tasks scheduled for this day.
            </div>
          ) : (
            selectedTasks.map((task) => (
              <button
                key={task._id}
                type="button"
                onClick={() => onTaskClick(task)}
                className="w-full rounded-xl border border-border bg-background p-3 text-left hover:bg-accent"
              >
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.dueDate ? format(new Date(task.dueDate), "h:mm a") : "No time"} · {task.progress}%
                </p>
                <div className="mt-2">
                  <PriorityBadge priority={task.priority} />
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
