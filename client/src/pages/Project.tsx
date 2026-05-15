import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BusinessLayout } from "@/components/business/BusinessLayout";
import { ProjectDialog } from "@/components/business/ProjectDialog";
import { ProjectHeader } from "@/components/business/ProjectHeader";
import { TaskDialog } from "@/components/business/TaskDialog";
import { BoardView } from "@/components/business/views/BoardView";
import { CalendarView } from "@/components/business/views/CalendarView";
import { ListView } from "@/components/business/views/ListView";
import { NotesView } from "@/components/business/views/NotesView";
import { useListTasks, useProject } from "@/lib/business.queries";
import type { BusinessView, Task, TaskStatus } from "@/types/business";

const DEFAULT_VIEW: BusinessView = "board";

export default function Project() {
  const navigate = useNavigate();
  const { projectId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdFromSearch = searchParams.get("taskId");
  const { data: project, isLoading } = useProject(projectId);
  const { data: taskData } = useListTasks(projectId);
  const tasks = taskData?.items ?? [];

  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = React.useState<TaskStatus | undefined>();
  const [activeView, setActiveView] = React.useState<BusinessView>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`business_view_${projectId}`) : null;
    return (saved as BusinessView) || DEFAULT_VIEW;
  });

  const suggestedTags = React.useMemo(
    () => Array.from(new Set(tasks.flatMap((task) => task.tags))).sort(),
    [tasks]
  );

  React.useEffect(() => {
    localStorage.setItem(`business_view_${projectId}`, activeView);
  }, [activeView, projectId]);

  React.useEffect(() => {
    if (!taskIdFromSearch) return;
    const task = tasks.find((entry) => entry._id === taskIdFromSearch);
    if (!task) return;
    setSelectedTask(task);
    setInitialStatus(undefined);
    setTaskDialogOpen(true);
  }, [taskIdFromSearch, tasks]);

  function openTaskDialog(task?: Task | null, status?: TaskStatus) {
    setSelectedTask(task ?? null);
    setInitialStatus(status);
    setTaskDialogOpen(true);
  }

  function closeTaskDialog(open: boolean) {
    setTaskDialogOpen(open);
    if (!open) {
      setSelectedTask(null);
      setInitialStatus(undefined);
      if (taskIdFromSearch) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("taskId");
        setSearchParams(nextParams, { replace: true });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-2xl font-semibold">Project not found</p>
        <Button type="button" onClick={() => navigate("/business")}>
          Back to Business
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-4">
        <Link to="/business" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
      </div>

      <ProjectHeader project={project} tasks={tasks} onNewTask={() => openTaskDialog(null)} />

      <div className="mt-6">
        <BusinessLayout
          projectId={projectId}
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateProject={() => setProjectDialogOpen(true)}
        >
          {activeView === "board" && (
            <BoardView
              projectId={projectId}
              tasks={tasks}
              onTaskClick={(task) => openTaskDialog(task)}
              onCreateTask={(status) => openTaskDialog(null, status)}
            />
          )}
          {activeView === "calendar" && (
            <CalendarView tasks={tasks} onTaskClick={(task) => openTaskDialog(task)} />
          )}
          {activeView === "list" && (
            <ListView projectId={projectId} tasks={tasks} onTaskClick={(task) => openTaskDialog(task)} />
          )}
          {activeView === "notes" && <NotesView projectId={projectId} />}
        </BusinessLayout>
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={closeTaskDialog}
        projectId={projectId}
        task={selectedTask}
        initialStatus={initialStatus}
        suggestedTags={suggestedTags}
      />

      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </div>
  );
}
