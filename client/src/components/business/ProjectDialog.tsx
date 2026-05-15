import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProject, useUpdateProject } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import type { Project } from "@/types/business";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(120),
  description: z.string().trim().max(2000),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Use a valid hex color"),
  icon: z.string().trim().min(1).max(80),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ICON_OPTIONS = ["folder", "briefcase", "layers", "rocket", "target", "lightbulb"];
const COLOR_OPTIONS = ["#4F46E5", "#2563EB", "#0F766E", "#D97706", "#DB2777", "#DC2626"];

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSaved?: (project: Project) => void;
}) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(project?._id ?? "");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      color: project?.color ?? "#4F46E5",
      icon: project?.icon ?? "folder",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: project?.name ?? "",
      description: project?.description ?? "",
      color: project?.color ?? "#4F46E5",
      icon: project?.icon ?? "folder",
    });
  }, [form, project, open]);

  const pending = createProject.isPending || updateProject.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      const saved = project
        ? await updateProject.mutateAsync(values)
        : await createProject.mutateAsync(values);
      toast.success(project ? "Project updated" : "Project created");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save the project"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            Set the basics now. You can adjust status and details later from the project header.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" autoFocus {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              className="min-h-24"
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Choose ${color}`}
                    onClick={() => form.setValue("color", color, { shouldDirty: true })}
                    className="size-9 rounded-full border border-border"
                    style={{
                      backgroundColor: color,
                      boxShadow:
                        form.watch("color") === color
                          ? "0 0 0 2px hsl(var(--background)), 0 0 0 4px currentColor"
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-3 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => form.setValue("icon", icon, { shouldDirty: true })}
                    className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                      form.watch("icon") === icon
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="px-0 pb-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
