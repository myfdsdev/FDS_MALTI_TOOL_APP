export type ProjectStatus = "active" | "archived" | "completed";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type BusinessView = "board" | "calendar" | "list" | "notes";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ProjectRef {
  _id: string;
  name: string;
  color: string;
  status?: ProjectStatus;
}

export interface Project {
  _id: string;
  user: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  members: string[];
  taskCount: number;
  completedCount: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  user: string;
  project: string | ProjectRef;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  progress: number;
  checklist: ChecklistItem[];
  tags: string[];
  assignee: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  user: string;
  project: string | null;
  task: string | null;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  recentTasks: Task[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedThisWeek: number;
  overdueCount: number;
}

export type CalendarTasksGroup = Record<string, Task[]>;

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: ProjectStatus;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  progress?: number;
  checklist?: ChecklistItem[];
  tags?: string[];
  assignee?: string | null;
  position?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  progress?: number;
  checklist?: ChecklistItem[];
  tags?: string[];
  assignee?: string | null;
  position?: number;
}

export interface CreateNoteInput {
  projectId?: string;
  taskId?: string;
  title?: string;
  content?: string;
  pinned?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  pinned?: boolean;
}

export interface ReorderTasksInput {
  projectId: string;
  status: TaskStatus;
  taskIds: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: "position" | "dueDate" | "priority";
  page?: number;
  limit?: number;
}

export interface NoteFilters {
  projectId?: string;
  taskId?: string;
  pinned?: boolean;
}

export interface ChecklistItemUpdate {
  text?: string;
  done?: boolean;
}

export interface LinkPreview {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  favicon: string;
  url: string;
}

export function isProjectRef(project: Task["project"]): project is ProjectRef {
  return typeof project === "object" && project !== null;
}

export function getTaskProjectId(task: Task) {
  return isProjectRef(task.project) ? task.project._id : task.project;
}

export function getTaskProjectMeta(task: Task): ProjectRef | null {
  return isProjectRef(task.project) ? task.project : null;
}
