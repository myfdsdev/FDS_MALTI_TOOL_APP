import { Briefcase, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useListProjects } from "@/lib/business.queries";
import { cn } from "@/lib/utils";

export function ProjectSidebar({
  currentProjectId,
  onCreateProject,
}: {
  currentProjectId?: string;
  onCreateProject: () => void;
}) {
  const { data } = useListProjects("active");
  const projects = data?.items ?? [];

  return (
    <aside className="hidden w-72 shrink-0 rounded-2xl border border-border bg-card p-4 lg:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Projects</p>
          <p className="text-xs text-muted-foreground">Jump between active workspaces.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCreateProject}>
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {projects.map((project) => (
          <Link
            key={project._id}
            to={`/business/projects/${project._id}`}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors hover:bg-accent",
              currentProjectId === project._id
                ? "border-primary bg-primary/5"
                : "border-transparent"
            )}
          >
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">
                {project.completedCount}/{project.taskCount} complete
              </p>
            </div>
          </Link>
        ))}

        {projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <Briefcase className="size-4" />
              No projects yet
            </div>
            Create your first project to start organizing work.
          </div>
        )}
      </div>
    </aside>
  );
}
