import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import * as businessApi from "@/lib/business.api";
import { businessKeys } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ProjectDetail, Task, TaskStatus } from "@/types/business";
import { TaskCard } from "../TaskCard";

type ColumnState = Record<TaskStatus, Task[]>;

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};
const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10",
  in_progress: "bg-blue-500/10",
  review: "bg-amber-500/10",
  done: "bg-emerald-500/10",
};

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

function groupTasks(tasks: Task[]): ColumnState {
  return {
    todo: sortTasks(tasks.filter((task) => task.status === "todo")),
    in_progress: sortTasks(tasks.filter((task) => task.status === "in_progress")),
    review: sortTasks(tasks.filter((task) => task.status === "review")),
    done: sortTasks(tasks.filter((task) => task.status === "done")),
  };
}

function flattenColumns(columns: ColumnState) {
  return STATUSES.flatMap((status) =>
    columns[status].map((task, index) => ({
      ...task,
      status,
      position: index,
    }))
  );
}

function findStatusForId(columns: ColumnState, id: string): TaskStatus | null {
  if (STATUSES.includes(id as TaskStatus)) {
    return id as TaskStatus;
  }

  return (
    STATUSES.find((status) => columns[status].some((task) => task._id === id)) ?? null
  );
}

function updateProjectCountsInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | undefined,
  projectId: string,
  completedDelta: number
) {
  if (completedDelta === 0) return;

  queryClient.setQueryData<ProjectDetail | undefined>(businessKeys.project(userId, projectId), (current) =>
    current
      ? {
          ...current,
          completedCount: current.completedCount + completedDelta,
          progressPercent:
            current.taskCount > 0
              ? Math.round(((current.completedCount + completedDelta) / current.taskCount) * 100)
              : 0,
        }
      : current
  );

  queryClient.setQueriesData({ queryKey: businessKeys.projects(userId) }, (current) => {
    if (!current || typeof current !== "object" || !("items" in current)) return current;
    const value = current as { items: ProjectDetail[] };
    return {
      ...current,
      items: value.items.map((project) =>
        project._id === projectId
          ? {
              ...project,
              completedCount: project.completedCount + completedDelta,
              progressPercent:
                project.taskCount > 0
                  ? Math.round(((project.completedCount + completedDelta) / project.taskCount) * 100)
                  : 0,
            }
          : project
      ),
    };
  });
}

function SortableTask({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-70" : undefined}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function DroppableColumn({
  status,
  tasks,
  onTaskClick,
  onCreateTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[24rem] min-w-[18rem] flex-1 flex-col rounded-2xl border border-border bg-muted/40 p-3 ${
        isOver ? "ring-2 ring-primary/35" : ""
      }`}
    >
      <div className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 ${COLUMN_STYLES[status]}`}>
        <div>
          <p className="text-sm font-semibold">{STATUS_LABELS[status]}</p>
          <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <button
          type="button"
          onClick={() => onCreateTask(status)}
          className="rounded-md p-2 hover:bg-background/70"
          aria-label={`Create ${STATUS_LABELS[status]} task`}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div key={task._id} layout>
                <SortableTask task={task} onClick={() => onTaskClick(task)} />
              </motion.div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function BoardView({
  projectId,
  tasks,
  onTaskClick,
  onCreateTask,
}: {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [columns, setColumns] = React.useState<ColumnState>(() => groupTasks(tasks));

  React.useEffect(() => {
    setColumns(groupTasks(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromStatus = findStatusForId(columns, activeId);
    const toStatus = findStatusForId(columns, overId);

    if (!fromStatus || !toStatus) return;

    const previousColumns = columns;
    const sourceItems = [...columns[fromStatus]];
    const sourceIndex = sourceItems.findIndex((task) => task._id === activeId);
    if (sourceIndex === -1) return;

    const movedTask = sourceItems[sourceIndex];
    const targetItems = fromStatus === toStatus ? sourceItems : [...columns[toStatus]];
    const overIndex =
      STATUSES.includes(overId as TaskStatus)
        ? targetItems.length
        : targetItems.findIndex((task) => task._id === overId);

    let nextColumns: ColumnState;

    if (fromStatus === toStatus) {
      nextColumns = {
        ...columns,
        [fromStatus]: arrayMove(sourceItems, sourceIndex, overIndex),
      };
    } else {
      sourceItems.splice(sourceIndex, 1);
      const nextTask = { ...movedTask, status: toStatus };
      targetItems.splice(overIndex, 0, nextTask);
      nextColumns = {
        ...columns,
        [fromStatus]: sourceItems,
        [toStatus]: targetItems,
      };
    }

    const nextItems = flattenColumns(nextColumns);
    const previousItems = flattenColumns(previousColumns);
    const completedDelta =
      fromStatus !== "done" && toStatus === "done"
        ? 1
        : fromStatus === "done" && toStatus !== "done"
          ? -1
          : 0;

    setColumns(nextColumns);
    queryClient.setQueryData(businessKeys.taskList(userId, projectId), (current: unknown) =>
      current && typeof current === "object" && "items" in (current as Record<string, unknown>)
        ? { ...(current as Record<string, unknown>), items: nextItems }
        : current
    );
    updateProjectCountsInCache(queryClient, userId, projectId, completedDelta);

    try {
      const calls: Array<Promise<unknown>> = [
        businessApi.reorderTasks({
          projectId,
          status: toStatus,
          taskIds: nextColumns[toStatus].map((task) => task._id),
        }),
      ];

      if (fromStatus !== toStatus) {
        calls.push(
          businessApi.updateTask(activeId, { status: toStatus }),
          businessApi.reorderTasks({
            projectId,
            status: fromStatus,
            taskIds: nextColumns[fromStatus].map((task) => task._id),
          })
        );
      }

      await Promise.all(calls);

      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
    } catch (error) {
      setColumns(previousColumns);
      queryClient.setQueryData(businessKeys.taskList(userId, projectId), (current: unknown) =>
        current && typeof current === "object" && "items" in (current as Record<string, unknown>)
          ? { ...(current as Record<string, unknown>), items: previousItems }
          : current
      );
      updateProjectCountsInCache(queryClient, userId, projectId, -completedDelta);
      toast.error(extractErrorMessage(error, "Couldn't move that task"));
    }
  }

  return (
    <div className="overflow-x-auto pb-3">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex min-w-max gap-4">
          {STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              tasks={columns[status]}
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
