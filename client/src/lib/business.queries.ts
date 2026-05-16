import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as businessApi from "./business.api";
import { scopeKey } from "@/lib/query-scope";
import { useAuthStore } from "@/stores/auth.store";
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
  all: (userId?: string | null) => ["business", scopeKey(userId)] as const,
  projects: (userId?: string | null) => [...businessKeys.all(userId), "projects"] as const,
  projectList: (userId: string | null | undefined, status?: string) =>
    [...businessKeys.projects(userId), "list", { status }] as const,
  project: (userId: string | null | undefined, projectId: string) =>
    [...businessKeys.all(userId), "project", projectId] as const,
  tasks: (userId: string | null | undefined, projectId: string) =>
    [...businessKeys.all(userId), "tasks", projectId] as const,
  taskList: (userId: string | null | undefined, projectId: string, filters?: TaskFilters) =>
    [...businessKeys.tasks(userId, projectId), "list", filters ?? {}] as const,
  task: (userId: string | null | undefined, taskId: string) =>
    [...businessKeys.all(userId), "task", taskId] as const,
  notes: (userId: string | null | undefined, filters?: NoteFilters) =>
    [...businessKeys.all(userId), "notes", filters ?? {}] as const,
  notesRoot: (userId?: string | null) => [...businessKeys.all(userId), "notes"] as const,
  today: (userId?: string | null) => [...businessKeys.all(userId), "today"] as const,
  calendar: (userId: string | null | undefined, from: string, to: string) =>
    [...businessKeys.all(userId), "calendar", from, to] as const,
  stats: (userId?: string | null) => [...businessKeys.all(userId), "stats"] as const,
};

export function useListProjects(status?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.projectList(userId, status),
    queryFn: () => businessApi.listProjects(status),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useProject(projectId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.project(userId, projectId),
    queryFn: () => businessApi.getProject(projectId),
    enabled: Boolean(userId && projectId),
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: CreateProjectInput) => businessApi.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => businessApi.updateProject(projectId, input),
    onSuccess: (project) => {
      queryClient.setQueryData(businessKeys.project(userId, projectId), project);
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
    },
  });
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: () => businessApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.removeQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.removeQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.removeQueries({ queryKey: businessKeys.notes(userId, { projectId }) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
    },
  });
}

export function useListTasks(projectId: string, filters?: TaskFilters) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.taskList(userId, projectId, filters),
    queryFn: () => businessApi.listTasks(projectId, filters),
    enabled: Boolean(userId && projectId),
    staleTime: 30_000,
  });
}

export function useTask(taskId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.task(userId, taskId),
    queryFn: () => businessApi.getTask(taskId),
    enabled: Boolean(userId && taskId),
    staleTime: 30_000,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: CreateTaskInput) => businessApi.createTask(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
    },
  });
}

export function useUpdateTask(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => businessApi.updateTask(taskId, input),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(userId, taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
    },
  });
}

export function useDeleteTask(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: () => businessApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: businessKeys.task(userId, taskId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.project(userId, projectId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.projects(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.stats(userId) });
      queryClient.invalidateQueries({ queryKey: businessKeys.today(userId) });
    },
  });
}

export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: ReorderTasksInput) => businessApi.reorderTasks(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
    },
  });
}

export function useAddChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: { text: string }) => businessApi.addChecklistItem(taskId, input),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(userId, taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
    },
  });
}

export function useUpdateChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: { itemId: string; update: { text?: string; done?: boolean } }) =>
      businessApi.updateChecklistItem(taskId, input.itemId, input.update),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: businessKeys.task(userId, taskId) });
      const previous = queryClient.getQueryData<Task>(businessKeys.task(userId, taskId));
      if (previous) {
        queryClient.setQueryData<Task>(businessKeys.task(userId, taskId), {
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
        queryClient.setQueryData(businessKeys.task(userId, taskId), context.previous);
      }
    },
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(userId, taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
    },
  });
}

export function useDeleteChecklistItem(taskId: string, projectId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (itemId: string) => businessApi.deleteChecklistItem(taskId, itemId),
    onSuccess: (task) => {
      queryClient.setQueryData(businessKeys.task(userId, taskId), task);
      queryClient.invalidateQueries({ queryKey: businessKeys.tasks(userId, projectId) });
    },
  });
}

export function useListNotes(filters?: NoteFilters) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.notes(userId, filters),
    queryFn: () => businessApi.listNotes(filters),
    enabled: Boolean(userId),
    staleTime: 15_000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: CreateNoteInput) => businessApi.createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.notesRoot(userId) });
    },
  });
}

export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: UpdateNoteInput) => businessApi.updateNote(noteId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: businessKeys.notesRoot(userId) });
      const snapshots: Array<[readonly unknown[], Note[] | undefined]> = [];
      const queries = queryClient.getQueriesData<Note[]>({ queryKey: businessKeys.notesRoot(userId) });
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
      queryClient.invalidateQueries({ queryKey: businessKeys.notesRoot(userId) });
    },
  });
}

export function useDeleteNote(noteId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: () => businessApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.notesRoot(userId) });
    },
  });
}

export function useTodayTasks() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.today(userId),
    queryFn: businessApi.getTodayTasks,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useCalendarTasks(from: string, to: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.calendar(userId, from, to),
    queryFn: () => businessApi.getCalendarTasks(from, to),
    enabled: Boolean(userId && from && to),
    staleTime: 30_000,
  });
}

export function useStats() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: businessKeys.stats(userId),
    queryFn: businessApi.getStats,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}
