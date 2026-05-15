import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectDialog } from "@/components/business/ProjectDialog";
import { ProgressRing } from "@/components/business/ProgressRing";
import { TodayWidget } from "@/components/business/TodayWidget";
import { useDeleteProject, useListProjects, useStats, useTodayTasks } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import type { Project } from "@/types/business";

export default function Business() {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { data: projectsData, isLoading } = useListProjects();
  const { data: stats } = useStats();
  const { data: todayTasks = [] } = useTodayTasks();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);

  const projects = projectsData?.items ?? [];

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash, todayTasks.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Briefcase className="size-3.5 text-primary" />
            Business workspace
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage today&apos;s priorities and jump into any project board from one place.
          </p>
        </div>

        <Button type="button" className="hidden sm:inline-flex" onClick={() => setProjectDialogOpen(true)}>
          <Plus className="size-4" />
          New Project
        </Button>
      </header>

      <section className="mt-8">
        <TodayWidget tasks={todayTasks} />
      </section>

      {stats && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total projects", stats.totalProjects],
            ["Active", stats.activeProjects],
            ["Tasks this week", stats.completedThisWeek],
            ["Overdue", stats.overdueCount],
          ].map(([label, value], index) => (
            <Card key={label}>
              <CardContent className="p-5">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : index * 0.04 }}
                >
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
                </motion.div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your projects</h2>
          <button
            type="button"
            onClick={() => setProjectDialogOpen(true)}
            className="text-sm font-medium text-primary hover:underline sm:hidden"
          >
            Add project
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="size-8" />
              </div>
              <div>
                <p className="text-xl font-semibold">Create your first project</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Start with a single workspace, then organize tasks by status, due date, and notes.
                </p>
              </div>
              <Button type="button" onClick={() => setProjectDialogOpen(true)}>
                Create project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: reducedMotion ? 0 : 0.04 },
              },
            }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                reducedMotion={Boolean(reducedMotion)}
                onOpen={() => navigate(`/business/projects/${project._id}`)}
              />
            ))}
          </motion.div>
        )}
      </section>

      <section id="today-list" className="mt-10">
        <h2 className="text-xl font-semibold">Today across all projects</h2>
        <div className="mt-4 space-y-3">
          {todayTasks.length === 0 ? (
            <Card>
              <CardContent className="px-6 py-8 text-sm text-muted-foreground">
                Nothing due today right now.
              </CardContent>
            </Card>
          ) : (
            todayTasks.map((task) => (
              <button
                key={task._id}
                type="button"
                onClick={() => navigate(`/business/projects/${typeof task.project === "string" ? task.project : task.project._id}?taskId=${task._id}`)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-4 text-left hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {typeof task.project === "string" ? "Project" : task.project.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                </p>
              </button>
            ))
          )}
        </div>
      </section>

      <Button
        type="button"
        onClick={() => setProjectDialogOpen(true)}
        className="fixed bottom-6 right-6 h-12 rounded-full px-5 shadow-lg sm:hidden"
      >
        <Plus className="size-4" />
        New Project
      </Button>

      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </div>
  );
}

function ProjectCard({
  project,
  reducedMotion,
  onOpen,
}: {
  project: Project;
  reducedMotion: boolean;
  onOpen: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteProject = useDeleteProject(project._id);

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteProject.mutateAsync();
      toast.success(`Deleted "${project.name}"`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete that project"));
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
        show: { opacity: 1, y: 0 },
      }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
            <p className="truncate text-lg font-semibold">{project.name}</p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.description || "No description yet."}
          </p>
        </div>
        <ProgressRing value={project.progressPercent} />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1">
          {project.taskCount} task{project.taskCount === 1 ? "" : "s"}
        </span>
        <span className="rounded-full bg-muted px-3 py-1">
          {project.completedCount} complete
        </span>
      </div>

      <div
        className="absolute right-3 top-3"
        onClick={(event) => event.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded px-2 py-1 text-xs hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(event) => void handleDelete(event)}
              disabled={deleteProject.isPending}
              className="rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
            >
              {deleteProject.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete ${project.name}`}
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
