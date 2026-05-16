import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resumeApi from "./resume.api";
import type {
  CreateResumeInput,
  Resume,
  UpdateResumeInput,
} from "@/types/resume";

export const resumeKeys = {
  all: ["resumes"] as const,
  list: () => ["resumes", "list"] as const,
  detail: (id: string) => ["resumes", "detail", id] as const,
  public: (slug: string) => ["resumes", "public", slug] as const,
};

export function useResumes() {
  return useQuery({
    queryKey: resumeKeys.list(),
    queryFn: resumeApi.listResumes,
    staleTime: 15_000,
  });
}

export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: id ? resumeKeys.detail(id) : ["resumes", "detail", "none"],
    queryFn: () => resumeApi.getResume(id as string),
    enabled: Boolean(id),
    staleTime: 5_000,
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResumeInput) => resumeApi.createResume(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateResumeInput) => resumeApi.updateResume(id, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: resumeKeys.detail(id) });
      const previous = qc.getQueryData<Resume>(resumeKeys.detail(id));
      if (previous) {
        const merged: Resume = {
          ...previous,
          ...input,
          content: input.content
            ? ({ ...previous.content, ...input.content } as Resume["content"])
            : previous.content,
        };
        qc.setQueryData(resumeKeys.detail(id), merged);
      }
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) qc.setQueryData(resumeKeys.detail(id), context.previous);
    },
    onSuccess: (resume) => {
      qc.setQueryData(resumeKeys.detail(id), resume);
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useDuplicateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeApi.duplicateResume(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useAiStarterFill(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bio: string) => resumeApi.aiStarterFill(id, bio),
    onSuccess: (resume) => {
      qc.setQueryData(resumeKeys.detail(id), resume);
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
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
  return useMutation({
    mutationFn: () => resumeApi.aiAtsCheck(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
    },
  });
}

export function useUpdateShare(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => resumeApi.updateShare(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.list() });
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
