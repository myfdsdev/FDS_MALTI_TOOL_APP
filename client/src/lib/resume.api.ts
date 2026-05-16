import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  ATSCheckResult,
  CreateResumeInput,
  PublicResume,
  Resume,
  ResumeListItem,
  ShareUpdateResult,
  UpdateResumeInput,
} from "@/types/resume";

const base = "/business/resumes";

export async function listResumes(): Promise<ResumeListItem[]> {
  const response = await api.get<ApiSuccess<ResumeListItem[]>>(base);
  return response.data.data;
}

export async function getResume(id: string): Promise<Resume> {
  const response = await api.get<ApiSuccess<Resume>>(`${base}/${id}`);
  return response.data.data;
}

export async function createResume(input: CreateResumeInput): Promise<Resume> {
  const response = await api.post<ApiSuccess<Resume>>(base, input);
  return response.data.data;
}

export async function updateResume(id: string, input: UpdateResumeInput): Promise<Resume> {
  const response = await api.patch<ApiSuccess<Resume>>(`${base}/${id}`, input);
  return response.data.data;
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`${base}/${id}`);
}

export async function duplicateResume(id: string): Promise<Resume> {
  const response = await api.post<ApiSuccess<Resume>>(`${base}/${id}/duplicate`);
  return response.data.data;
}

export async function aiStarterFill(id: string, bio: string): Promise<Resume> {
  const response = await api.post<ApiSuccess<Resume>>(`${base}/${id}/ai/starter-fill`, { bio });
  return response.data.data;
}

export async function aiImproveField(
  id: string,
  input: { field: string; context?: string }
): Promise<{ suggestion: string }> {
  const response = await api.post<ApiSuccess<{ suggestion: string }>>(
    `${base}/${id}/ai/improve-field`,
    input
  );
  return response.data.data;
}

export async function aiGenerateBullets(
  id: string,
  input: { role: string; company?: string; existingBullets?: string[] }
): Promise<{ bullets: string[] }> {
  const response = await api.post<ApiSuccess<{ bullets: string[] }>>(
    `${base}/${id}/ai/generate-bullets`,
    input
  );
  return response.data.data;
}

export async function aiSuggestSkills(
  id: string,
  input: { jobTitle: string; currentSkills?: string[] }
): Promise<{ skills: { category: string; items: string[] }[] }> {
  const response = await api.post<ApiSuccess<{ skills: { category: string; items: string[] }[] }>>(
    `${base}/${id}/ai/suggest-skills`,
    input
  );
  return response.data.data;
}

export async function aiAtsCheck(id: string): Promise<ATSCheckResult> {
  const response = await api.post<ApiSuccess<ATSCheckResult>>(`${base}/${id}/ai/ats-check`);
  return response.data.data;
}

export async function updateShare(id: string, enabled: boolean): Promise<ShareUpdateResult> {
  const response = await api.post<ApiSuccess<ShareUpdateResult>>(`${base}/${id}/share`, {
    enabled,
  });
  return response.data.data;
}

export function exportPdfUrl(id: string): string {
  return `${api.defaults.baseURL}${base}/${id}/export/pdf`;
}

export function exportDocxUrl(id: string): string {
  return `${api.defaults.baseURL}${base}/${id}/export/docx`;
}

export async function downloadExport(id: string, format: "pdf" | "docx", filename: string): Promise<void> {
  const url = `${base}/${id}/export/${format}`;
  const response = await api.get(url, { responseType: "blob" });
  const blob = response.data as Blob;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function getPublicResume(slug: string): Promise<PublicResume> {
  const response = await api.get<ApiSuccess<PublicResume>>(`/public/resumes/${slug}`);
  return response.data.data;
}

export function publicPdfUrl(slug: string): string {
  return `${api.defaults.baseURL}/public/resumes/${slug}/export/pdf`;
}
