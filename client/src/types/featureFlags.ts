export type WorkspaceKey =
  | "ideas"
  | "projects"
  | "calendar"
  | "notes"
  | "link-saver"
  | "resumes"
  | "reports";

export const ALL_WORKSPACE_KEYS: WorkspaceKey[] = [
  "ideas",
  "projects",
  "calendar",
  "notes",
  "link-saver",
  "resumes",
  "reports",
];

export const WORKSPACE_LABELS: Record<WorkspaceKey, string> = {
  ideas: "Business Ideas (50+ AI tools catalog)",
  projects: "Projects & Tasks",
  calendar: "Calendar",
  notes: "Notes",
  "link-saver": "Link Saver",
  resumes: "Resumes",
  reports: "Growth Reports",
};

export interface PublicFeatureFlags {
  disabledTools: string[];
  disabledWorkspaces: WorkspaceKey[];
}

export interface AdminFeatureFlags extends PublicFeatureFlags {
  allWorkspaces: WorkspaceKey[];
  allToolIds: string[];
}
