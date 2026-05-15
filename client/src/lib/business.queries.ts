import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as businessApi from "./business.api";
import type {
  CreateNoteInput,
  CreateProjectInput,
  CreateTaskInput,
  Note,
  NoteFilters,
  ReorderTasksInput,
  Task,
  TaskFilters,
  UpdateNoteInput,
  UpdateProjectInput,
  UpdateTaskInput,
} from "@/types/business";

export const businessKeys = {
  projects: ["business", "projects"] as const,
  projectList: (status?: string) => ["business", "projects", "list", { status }] as const,
  project: (projectId: string) => ["business", "project", projectId] as const,
  tasks: (projectId: string) => ["business", "tasks", projectId] as const,
  taskList: (projectId: string, filters?: TaskFilters) =>
    ["business", "tasks", projectId, "list", filters ?? {}] as const,
  task: (taskId: string) => ["business", "task", taskId] as const,
  notes: (filters?: NoteFilters) => ["business", "notes", filters ?? {}] as const,
  today: ["business", "today"] as const,
  calendar: (from: string, to: string) => ["business", "calendar", from, to] as const,
  stats: ["business", "stats"] as const,
};

export function useListProjects(status?: string) {
  return useQuery({
    queryKey: businessKeys.projectList(status),
    queryFn: () => businessApi.listProjects(status),
    staleTime: 30_000,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: businessKeys.project(projectId),
    queryFn: () => businessApi.getProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => businessApi.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => businessApi.updateProject(projectId, input),
    onSuccess: (project) => {
      queryClient.setQueryData(businessKeys.project(projectId), project);
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
    },
  });
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => businessApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.removeQueries({ queryKey: businessKeys.project(projectId) });
      queryClient.removeQueries({ queryKey: businessKeys.tasks(projectId) });
      queryClient.removeQueries({ queryKey: businessKeys.notes({ projectId }) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
      queryClient.invalidateQueries({ queryKey: businessKeys.today });
    },
  });
}

export function useListTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: businessKeys.taskList(projectId, filters),
    queryFn: () => businessApi.listTasks(projectId, filters),
    enabled: Boolean(projectId),
    staleTime: 30_000,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: businessKeys.task(taskId),
    queryFn: () => businessApi.getTask(taskId),
    enabled: Boolean(taskId),
    staleTime: 30_000,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => businessApi.createTask(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
      queryClient.invalidateQueries({ queryKey: businessKeys.today });
    },
  });
}

export function useUpdateTask(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => businessApi.updateTask(taskId, input),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
      queryClient.invalidateQueries({ queryKey: businessKeys.today });
    },
  });
}

export function useDeleteTask(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => businessApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: businessKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats });
      queryClient.invalidateQueries({ queryKey: businessKeys.today });
    },
  });
}

export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderTasksInput) => businessApi.reorderTasks(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
    },
  });
}

export function useAddChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { text: string }) => businessApi.addChecklistItem(taskId, input),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
    },
  });
}

export function useUpdateChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { itemId: string; update: { text?: string; done?: boolean } }) =>
      businessApi.updateChecklistItem(taskId, input.itemId, input.update),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: businessKeys.task(taskId) });
      const previous = queryClient.getQueryData<Task>(businessKeys.task(taskId));
      if (previous) {
        queryClient.setQueryData<Task>(businessKeys.task(taskId), {
          ...previous,
          checklist: previous.checklist.map((entry) =>
            entry.id === input.itemId ? { ...entry, ...input.update } : entry
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(businessKeys.task(taskId), context.previous);
      }
    },
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
    },
  });
}

export function useDeleteChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => businessApi.deleteChecklistItem(taskId, itemId),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(projectId) });
    },
  });
}

export function useListNotes(filters?: NoteFilters) {
  return useQuery({
    queryKey: businessKeys.notes(filters),
    queryFn: () => businessApi.listNotes(filters),
    staleTime: 15_000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => businessApi.createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", "notes"] });
    },
  });
}

export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => businessApi.updateNote(noteId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["business", "notes"] });
      const snapshots: Array<[readonly unknown[], Note[] | undefined]> = [];
      const queries = queryClient.getQueriesData<Note[]>({ queryKey: ["business", "notes"] });
      for (const [key, value] of queries) {
        snapshots.push([key, value]);
        if (!value) continue;
        queryClient.setQueryData<Note[]>(
          key,
          value.map((note) => (note._id === noteId ? { ...note, ...input } : note))
        );
      }
      return { snapshots };
    },
    onError: (_err, _input, context) => {
      if (!context?.snapshots) return;
      for (const [key, value] of context.snapshots) {
        queryClient.setQueryData(key, value);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", "notes"] });
    },
  });
}

export function useDeleteNote(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => businessApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", "notes"] });
    },
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: businessKeys.today,
    queryFn: businessApi.getTodayTasks,
    staleTime: 30_000,
  });
}

export function useCalendarTasks(from: string, to: string) {
  return useQuery({
    queryKey: businessKeys.calendar(from, to),
    queryFn: () => businessApi.getCalendarTasks(from, to),
    enabled: Boolean(from && to),
    staleTime: 30_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: businessKeys.stats,
    queryFn: businessApi.getStats,
    staleTime: 30_000,
  });
}
