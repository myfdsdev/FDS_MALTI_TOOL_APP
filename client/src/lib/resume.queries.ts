import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resumeApi from "./resume.api";
import { scopeKey } from "@/lib/query-scope";
import { useAuthStore } from "@/stores/auth.store";
import type {
  CreateResumeInput,
  Resume,
  UpdateResumeInput,
} from "@/types/resume";

export const resumeKeys = {
  all: (userId?: string | null) => ["resumes", scopeKey(userId)] as const,
  list: (userId?: string | null) => [...resumeKeys.all(userId), "list"] as const,
  detail: (userId: string | null | undefined, id: string) =>
    [...resumeKeys.all(userId), "detail", id] as const,
  public: (slug: string) => ["resumes", "public", slug] as const,
};

export function useResumes() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: resumeKeys.list(userId),
    queryFn: resumeApi.listResumes,
    enabled: Boolean(userId),
    staleTime: 15_000,
  });
}

export function useResume(id: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: id ? resumeKeys.detail(userId, id) : [...resumeKeys.all(userId), "detail", "none"],
    queryFn: () => resumeApi.getResume(id as string),
    enabled: Boolean(userId && id),
    staleTime: 5_000,
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: CreateResumeInput) => resumeApi.createResume(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (input: UpdateResumeInput) => resumeApi.updateResume(id, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: resumeKeys.detail(userId, id) });
      const previous = qc.getQueryData<Resume>(resumeKeys.detail(userId, id));
      if (previous) {
        const merged: Resume = {
          ...previous,
          ...input,
          content: input.content
            ? ({ ...previous.content, ...input.content } as Resume["content"])
            : previous.content,
        };
        qc.setQueryData(resumeKeys.detail(userId, id), merged);
      }
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(resumeKeys.detail(userId, id), context.previous);
    },
    onSuccess: (resume) => {
      qc.setQueryData(resumeKeys.detail(userId, id), resume);
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: resumeKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useDuplicateResume() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (id: string) => resumeApi.duplicateResume(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useAiStarterFill(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (bio: string) => resumeApi.aiStarterFill(id, bio),
    onSuccess: (resume) => {
      qc.setQueryData(resumeKeys.detail(userId, id), resume);
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useAiImproveField(id: string) {
  return useMutation({
    mutationFn: (input: { field: string; context?: string }) =>
      resumeApi.aiImproveField(id, input),
  });
}

export function useAiGenerateBullets(id: string) {
  return useMutation({
    mutationFn: (input: { role: string; company?: string; existingBullets?: string[] }) =>
      resumeApi.aiGenerateBullets(id, input),
  });
}

export function useAiSuggestSkills(id: string) {
  return useMutation({
    mutationFn: (input: { jobTitle: string; currentSkills?: string[] }) =>
      resumeApi.aiSuggestSkills(id, input),
  });
}

export function useAiAtsCheck(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: () => resumeApi.aiAtsCheck(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function useUpdateShare(id: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: (enabled: boolean) => resumeApi.updateShare(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(userId, id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list(userId) });
    },
  });
}

export function usePublicResume(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? resumeKeys.public(slug) : ["resumes", "public", "none"],
    queryFn: () => resumeApi.getPublicResume(slug as string),
    enabled: Boolean(slug),
  });
}
