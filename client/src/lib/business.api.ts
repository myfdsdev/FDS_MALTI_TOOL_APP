import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  CalendarTasksGroup,
  ChecklistItemUpdate,
  CreateNoteInput,
  CreateProjectInput,
  CreateTaskInput,
  Note,
  NoteFilters,
  PaginatedResult,
  Project,
  ProjectDetail,
  ProjectStats,
  ReorderTasksInput,
  Task,
  TaskFilters,
  UpdateNoteInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "@/types/business";

export async function listProjects(status?: string) {
  const response = await api.get<ApiSuccess<PaginatedResult<Project>>>("/business/projects", {
    params: { status },
  });
  return response.data.data;
}

export async function createProject(input: CreateProjectInput) {
  const response = await api.post<ApiSuccess<Project>>("/business/projects", input);
  return response.data.data;
}

export async function getProject(id: string) {
  const response = await api.get<ApiSuccess<ProjectDetail>>(`/business/projects/${id}`);
  return response.data.data;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const response = await api.patch<ApiSuccess<Project>>(`/business/projects/${id}`, input);
  return response.data.data;
}

export async function deleteProject(id: string) {
  await api.delete(`/business/projects/${id}`);
}

export async function listTasks(projectId: string, filters?: TaskFilters) {
  const response = await api.get<ApiSuccess<PaginatedResult<Task>>>(
    `/business/projects/${projectId}/tasks`,
    { params: filters }
  );
  return response.data.data;
}

export async function createTask(projectId: string, input: CreateTaskInput) {
  const response = await api.post<ApiSuccess<Task>>(`/business/projects/${projectId}/tasks`, input);
  return response.data.data;
}

export async function getTask(id: string) {
  const response = await api.get<ApiSuccess<Task>>(`/business/tasks/${id}`);
  return response.data.data;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const response = await api.patch<ApiSuccess<Task>>(`/business/tasks/${id}`, input);
  return response.data.data;
}

export async function deleteTask(id: string) {
  await api.delete(`/business/tasks/${id}`);
}

export async function addChecklistItem(taskId: string, input: { text: string }) {
  const response = await api.post<ApiSuccess<Task>>(`/business/tasks/${taskId}/checklist`, input);
  return response.data.data;
}

export async function updateChecklistItem(taskId: string, itemId: string, input: ChecklistItemUpdate) {
  const response = await api.patch<ApiSuccess<Task>>(
    `/business/tasks/${taskId}/checklist/${itemId}`,
    input
  );
  return response.data.data;
}

export async function deleteChecklistItem(taskId: string, itemId: string) {
  const response = await api.delete<ApiSuccess<Task>>(`/business/tasks/${taskId}/checklist/${itemId}`);
  return response.data.data;
}

export async function reorderTasks(input: ReorderTasksInput) {
  await api.post("/business/tasks/reorder", input);
}

export async function listNotes(filters?: NoteFilters) {
  const response = await api.get<ApiSuccess<Note[]>>("/business/notes", { params: filters });
  return response.data.data;
}

export async function createNote(input: CreateNoteInput) {
  const response = await api.post<ApiSuccess<Note>>("/business/notes", input);
  return response.data.data;
}

export async function updateNote(id: string, input: UpdateNoteInput) {
  const response = await api.patch<ApiSuccess<Note>>(`/business/notes/${id}`, input);
  return response.data.data;
}

export async function deleteNote(id: string) {
  await api.delete(`/business/notes/${id}`);
}

export async function getTodayTasks() {
  const response = await api.get<ApiSuccess<Task[]>>("/business/today");
  return response.data.data;
}

export async function getCalendarTasks(from: string, to: string) {
  const response = await api.get<ApiSuccess<CalendarTasksGroup>>("/business/calendar", {
    params: { from, to },
  });
  return response.data.data;
}

export async function getStats() {
  const response = await api.get<ApiSuccess<ProjectStats>>("/business/stats");
  return response.data.data;
}
