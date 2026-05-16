import { useMemo } from "react";
import { addDays, format, startOfToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { BusinessTabs } from "@/components/business/BusinessTabs";
import { useCalendarTasks } from "@/lib/business.queries";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const DAYS_AHEAD = 30;

export default function BusinessCalendarPage() {
  const { from, to } = useMemo(() => {
    const start = startOfToday();
    return {
      from: format(start, "yyyy-MM-dd"),
      to: format(addDays(start, DAYS_AHEAD), "yyyy-MM-dd"),
    };
  }, []);

  const { data: grouped = {}, isLoading } = useCalendarTasks(from, to);

  const days = useMemo(() => {
    const start = startOfToday();
    return Array.from({ length: DAYS_AHEAD + 1 }, (_, i) => addDays(start, i));
  }, []);

  return (
    <div>
      <BusinessTabs />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary" />
            Calendar
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Upcoming tasks</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tasks with a due date across all your projects in the next {DAYS_AHEAD} days.
          </p>
        </header>

        <div className="mt-6 space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
              ))
            : days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const tasks = grouped[key] ?? [];
                if (tasks.length === 0) return null;
                return (
                  <Card key={key}>
                    <CardContent className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {format(day, "EEE, MMM d")}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {tasks.map((task) => {
                          const projectId =
                            typeof task.project === "string" ? task.project : task.project._id;
                          return (
                            <li key={task._id}>
                              <Link
                                to={`/business/projects/${projectId}?taskId=${task._id}`}
                                className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                              >
                                <span className="truncate">{task.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {typeof task.project === "string" ? "Project" : task.project.name}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}

          {!isLoading && Object.keys(grouped).length === 0 && (
            <Card>
              <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
                Nothing scheduled in the next {DAYS_AHEAD} days.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
