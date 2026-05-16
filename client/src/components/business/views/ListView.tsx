import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import * as businessApi from "@/lib/business.api";
import { businessKeys } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Task } from "@/types/business";
import { PriorityBadge } from "../PriorityBadge";
import { StatusPill } from "../StatusPill";

type SortField = "title" | "status" | "priority" | "dueDate" | "progress";

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

export function ListView({
  projectId,
  tasks,
  onTaskClick,
}: {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [sortField, setSortField] = React.useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [tagQuery, setTagQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  const filtered = React.useMemo(() => {
    const normalizedTagQuery = tagQuery.trim().toLowerCase();
    const result = tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (
        normalizedTagQuery &&
        !task.tags.some((tag) => tag.toLowerCase().includes(normalizedTagQuery))
      ) {
        return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let compare = 0;
      switch (sortField) {
        case "title":
          compare = a.title.localeCompare(b.title);
          break;
        case "status":
          compare = a.status.localeCompare(b.status);
          break;
        case "priority":
          compare = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          break;
        case "dueDate":
          compare =
            (a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER) -
            (b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER);
          break;
        case "progress":
          compare = a.progress - b.progress;
          break;
      }
      return sortDirection === "asc" ? compare : -compare;
    });

    return result;
  }, [priorityFilter, sortDirection, sortField, statusFilter, tagQuery, tasks]);

  function toggleSort(nextField: SortField) {
    if (sortField === nextField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(nextField);
    setSortDirection("asc");
  }

  async function bulkMarkDone() {
    setBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => businessApi.updateTask(id, { status: "done", progress: 100 })));
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
      toast.success("Tasks marked done");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't update those tasks"));
    } finally {
      setBusy(false);
    }
  }

  async function bulkDelete() {
    setBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => businessApi.deleteTask(id)));
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
      toast.success("Tasks deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete those tasks"));
    } finally {
      setBusy(false);
    }
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every((task) => selectedIds.includes(task._id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {["all", "todo", "in_progress", "review", "done"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              statusFilter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {status === "all"
              ? "All statuses"
              : status === "in_progress"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "low", "medium", "high", "urgent"].map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => setPriorityFilter(priority)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                priorityFilter === priority
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {priority === "all" ? "All priorities" : priority}
            </button>
          ))}
        </div>

        <input
          value={tagQuery}
          onChange={(event) => setTagQuery(event.target.value)}
          placeholder="Search tags"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkMarkDone()}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
          >
            <CheckCircle2 className="size-4" />
            Mark done
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkDelete()}
            className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      )}

      <div className="space-y-2 sm:hidden">
        {filtered.map((task) => {
          const checked = selectedIds.includes(task._id);
          return (
            <div
              key={task._id}
              className="rounded-2xl border border-border bg-card p-3"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    setSelectedIds((current) =>
                      event.target.checked
                        ? [...current, task._id]
                        : current.filter((id) => id !== task._id)
                    )
                  }
                  aria-label={`Select ${task.title}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <StatusPill status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span className="text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/70">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() =>
                    setSelectedIds(allVisibleSelected ? [] : filtered.map((task) => task._id))
                  }
                  aria-label="Select all visible tasks"
                />
              </th>
              {[
                ["title", "Title"],
                ["status", "Status"],
                ["priority", "Priority"],
                ["dueDate", "Due"],
                ["progress", "Progress"],
              ].map(([field, label]) => (
                <th key={field} className="px-4 py-3 text-left font-semibold">
                  <button type="button" onClick={() => toggleSort(field as SortField)} className="inline-flex items-center gap-1">
                    {label}
                    {sortField === field ? (
                      sortDirection === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                    ) : null}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr
                key={task._id}
                className="border-t border-border hover:bg-accent/40"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(task._id)}
                    onChange={(event) =>
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, task._id]
                          : current.filter((id) => id !== task._id)
                      )
                    }
                    aria-label={`Select ${task.title}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3">
                  <StatusPill status={task.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{task.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No tags</span>
                    ) : (
                      task.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No tasks match those filters.
        </div>
      )}
    </div>
  );
}
