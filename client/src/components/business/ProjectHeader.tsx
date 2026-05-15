import * as React from "react";
import { Archive, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateProject } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import type { Project, Task } from "@/types/business";
import { ProgressRing } from "./ProgressRing";
import { ProjectDialog } from "./ProjectDialog";

export function ProjectHeader({
  project,
  tasks,
  onNewTask,
}: {
  project: Project;
  tasks: Task[];
  onNewTask: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const updateProject = useUpdateProject(project._id);

  const counts = {
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    review: tasks.filter((task) => task.status === "review").length,
    done: tasks.filter((task) => task.status === "done").length,
  };

  async function archiveProject() {
    try {
      await updateProject.mutateAsync({
        status: project.status === "archived" ? "active" : "archived",
      });
      toast.success(project.status === "archived" ? "Project reactivated" : "Project archived");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't update the project status"));
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: project.color }}
                aria-hidden="true"
              />
              <h1 className="truncate text-2xl font-semibold tracking-tight">{project.name}</h1>
            </div>
            {project.description && (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{project.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">{counts.todo} todo</span>
              <span className="rounded-full bg-muted px-3 py-1">{counts.inProgress} in progress</span>
              <span className="rounded-full bg-muted px-3 py-1">{counts.review} review</span>
              <span className="rounded-full bg-muted px-3 py-1">{counts.done} done</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProgressRing value={project.progressPercent} size={60} />
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button type="button" variant="outline" onClick={archiveProject}>
              <Archive className="size-4" />
              {project.status === "archived" ? "Unarchive" : "Archive"}
            </Button>
            <Button type="button" onClick={onNewTask}>
              <Plus className="size-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      <ProjectDialog open={editing} onOpenChange={setEditing} project={project} />
    </>
  );
}
