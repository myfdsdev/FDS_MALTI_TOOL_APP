import type { ReactNode } from "react";
import type { BusinessView } from "@/types/business";
import { ProjectSidebar } from "./ProjectSidebar";

const TAB_LABELS: Record<BusinessView, string> = {
  board: "Board",
  calendar: "Calendar",
  list: "List",
  notes: "Notes",
};

export function BusinessLayout({
  projectId,
  activeView,
  onViewChange,
  onCreateProject,
  children,
}: {
  projectId: string;
  activeView: BusinessView;
  onViewChange: (view: BusinessView) => void;
  onCreateProject: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <ProjectSidebar currentProjectId={projectId} onCreateProject={onCreateProject} />

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap gap-2 border-b border-border pb-3">
          {(Object.keys(TAB_LABELS) as BusinessView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeView === view
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {TAB_LABELS[view]}
            </button>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
