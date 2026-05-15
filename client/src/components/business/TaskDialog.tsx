import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage } from "@/lib/api";
import {
  useAddChecklistItem,
  useCreateTask,
  useDeleteChecklistItem,
  useDeleteTask,
  useUpdateChecklistItem,
  useUpdateTask,
} from "@/lib/business.queries";
import type { ChecklistItem, Task, TaskPriority, TaskStatus } from "@/types/business";
import { DateTimePicker } from "./DateTimePicker";
import { PriorityBadge } from "./PriorityBadge";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(5000),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  completedAt: z.date().nullable(),
  progress: z.number().int().min(0).max(100),
  tags: z.array(z.string().trim().min(1).max(50)),
  checklist: z.array(
    z.object({
      id: z.string(),
      text: z.string().trim().min(1).max(300),
      done: z.boolean(),
    })
  ),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const DEFAULT_STATUS: TaskStatus = "todo";
const DEFAULT_PRIORITY: TaskPriority = "medium";

function checklistId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `checklist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toFormValues(task?: Task | null, initialStatus?: TaskStatus): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? initialStatus ?? DEFAULT_STATUS,
    priority: task?.priority ?? DEFAULT_PRIORITY,
    startDate: task?.startDate ? new Date(task.startDate) : null,
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
    completedAt: task?.completedAt ? new Date(task.completedAt) : null,
    progress: task?.progress ?? 0,
    tags: task?.tags ?? [],
    checklist: task?.checklist ?? [],
  };
}

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  task,
  initialStatus,
  suggestedTags = [],
  onSaved,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  task?: Task | null;
  initialStatus?: TaskStatus;
  suggestedTags?: string[];
  onSaved?: (task: Task) => void;
  onDeleted?: () => void;
}) {
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(task?._id ?? "", projectId);
  const deleteTask = useDeleteTask(task?._id ?? "", projectId);
  const addChecklistItem = useAddChecklistItem(task?._id ?? "", projectId);
  const updateChecklistItem = useUpdateChecklistItem(task?._id ?? "", projectId);
  const deleteChecklistItem = useDeleteChecklistItem(task?._id ?? "", projectId);

  const [tagInput, setTagInput] = React.useState("");
  const [checklistInput, setChecklistInput] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: toFormValues(task, initialStatus),
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = form;

  const checklistArray = useFieldArray({
    control,
    name: "checklist",
    keyName: "fieldKey",
  });

  React.useEffect(() => {
    reset(toFormValues(task, initialStatus));
    setTagInput("");
    setChecklistInput("");
    setConfirmDelete(false);
  }, [task, initialStatus, open, reset]);

  const status = watch("status");
  const progress = watch("progress");
  const tags = watch("tags");
  const checklist = watch("checklist");
  const previousStatusRef = React.useRef<TaskStatus>(status);

  React.useEffect(() => {
    const previousStatus = previousStatusRef.current;
    if (previousStatus !== status) {
      if (status === "done" && progress !== 100) {
        setValue("progress", 100, { shouldDirty: true });
        setValue("completedAt", new Date(), { shouldDirty: true });
      } else if (status === "todo") {
        setValue("progress", 0, { shouldDirty: true });
        setValue("completedAt", null, { shouldDirty: true });
      } else if (previousStatus === "done" && status !== "done") {
        setValue("completedAt", null, { shouldDirty: true });
      }
    }
    previousStatusRef.current = status;
  }, [progress, setValue, status]);

  React.useEffect(() => {
    if (progress === 100 && status !== "done") {
      setValue("status", "done", { shouldDirty: true });
      setValue("completedAt", new Date(), { shouldDirty: true });
    }
  }, [progress, setValue, status]);

  async function submit(values: TaskFormValues) {
    try {
      const saved = task
        ? await updateTask.mutateAsync(values)
        : await createTask.mutateAsync(values);
      toast.success(task ? "Task updated" : "Task created");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save the task"));
    }
  }

  function addTag() {
    const nextTag = tagInput.trim().toLowerCase();
    if (!nextTag || tags.includes(nextTag)) return;
    setValue("tags", [...tags, nextTag], { shouldDirty: true });
    setTagInput("");
  }

  async function addChecklist() {
    const text = checklistInput.trim();
    if (!text) return;

    if (!task) {
      checklistArray.append({ id: checklistId(), text, done: false });
      setChecklistInput("");
      return;
    }

    try {
      const updated = await addChecklistItem.mutateAsync({ text });
      setValue("checklist", updated.checklist, { shouldDirty: true });
      setChecklistInput("");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't add that checklist item"));
    }
  }

  async function toggleChecklist(item: ChecklistItem) {
    const current = checklist;
    const next = current.map((entry) =>
      entry.id === item.id ? { ...entry, done: !entry.done } : entry
    );
    setValue("checklist", next, { shouldDirty: true });

    if (!task) return;

    try {
      const updated = await updateChecklistItem.mutateAsync({
        itemId: item.id,
        update: { done: !item.done },
      });
      setValue("checklist", updated.checklist, { shouldDirty: true });
    } catch (error) {
      setValue("checklist", current, { shouldDirty: true });
      toast.error(extractErrorMessage(error, "Couldn't update the checklist"));
    }
  }

  async function removeChecklist(item: ChecklistItem) {
    const current = checklist;
    const next = current.filter((entry) => entry.id !== item.id);
    setValue("checklist", next, { shouldDirty: true });

    if (!task) return;

    try {
      const updated = await deleteChecklistItem.mutateAsync(item.id);
      setValue("checklist", updated.checklist, { shouldDirty: true });
    } catch (error) {
      setValue("checklist", current, { shouldDirty: true });
      toast.error(extractErrorMessage(error, "Couldn't remove the checklist item"));
    }
  }

  async function updateChecklistText(item: ChecklistItem, text: string) {
    const current = checklist;
    const next = current.map((entry) => (entry.id === item.id ? { ...entry, text } : entry));
    setValue("checklist", next, { shouldDirty: true });

    if (!task) return;
    if (!text.trim()) return;

    try {
      const updated = await updateChecklistItem.mutateAsync({
        itemId: item.id,
        update: { text },
      });
      setValue("checklist", updated.checklist, { shouldDirty: true });
    } catch (error) {
      setValue("checklist", current, { shouldDirty: true });
      toast.error(extractErrorMessage(error, "Couldn't update the checklist"));
    }
  }

  async function handleDelete() {
    if (!task) return;
    try {
      await deleteTask.mutateAsync();
      toast.success("Task deleted");
      onDeleted?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete the task"));
    }
  }

  const pending =
    isSubmitting ||
    createTask.isPending ||
    updateTask.isPending ||
    deleteTask.isPending ||
    addChecklistItem.isPending ||
    updateChecklistItem.isPending ||
    deleteChecklistItem.isPending;

  const checklistDone = checklist.filter((item) => item.done).length;
  const availableSuggestions = suggestedTags.filter((tag) => !tags.includes(tag));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            Capture details, deadlines, tags, and checklist progress in one place.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" autoFocus {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              className="min-h-28"
              placeholder="Markdown is supported"
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select id="task-status" {...register("status")}>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select id="task-priority" {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
              <PriorityBadge priority={watch("priority")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start date</Label>
              <DateTimePicker
                value={watch("startDate")}
                onChange={(date) => setValue("startDate", date, { shouldDirty: true })}
                placeholder="No start date"
              />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <DateTimePicker
                value={watch("dueDate")}
                onChange={(date) => setValue("dueDate", date, { shouldDirty: true })}
                placeholder="No due date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-progress">Progress</Label>
              <span className="text-sm font-medium tabular-nums">{progress}%</span>
            </div>
            <input
              id="task-progress"
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(event) =>
                setValue("progress", Number(event.target.value), { shouldDirty: true })
              }
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tags">Tags</Label>
            <div className="rounded-xl border border-border p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "tags",
                          tags.filter((entry) => entry !== tag),
                          { shouldDirty: true }
                        )
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                id="task-tags"
                value={tagInput}
                list="project-tag-suggestions"
                placeholder="Type a tag and press Enter, comma, or Tab"
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (["Enter", ",", "Tab"].includes(event.key)) {
                    event.preventDefault();
                    addTag();
                  }
                  if (event.key === "Backspace" && !tagInput && tags.length > 0) {
                    setValue("tags", tags.slice(0, -1), { shouldDirty: true });
                  }
                }}
              />
              <datalist id="project-tag-suggestions">
                {availableSuggestions.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Checklist</Label>
              <span className="text-xs text-muted-foreground">
                {checklistDone}/{checklist.length} done
              </span>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => void toggleChecklist(item)}
                    />
                    <Input
                      value={item.text}
                      onChange={(event) => {
                        const next = checklist.slice();
                        next[index] = { ...item, text: event.target.value };
                        setValue("checklist", next, { shouldDirty: true });
                      }}
                      onBlur={(event) => void updateChecklistText(item, event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => void removeChecklist(item)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={checklistInput}
                  placeholder="Add a checklist item"
                  onChange={(event) => setChecklistInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addChecklist();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => void addChecklist()}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-0 pb-0 sm:justify-between">
            <div>
              {task && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete()}>
                      Confirm delete
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    Delete
                  </Button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
