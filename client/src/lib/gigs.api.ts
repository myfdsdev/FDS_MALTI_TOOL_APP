import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  Gig,
  GigInput,
  GigListItem,
  GigPlatform,
  GigStatus,
  ImproveResult,
  ImproveSection,
  PublicGig,
  ShareGigResult,
} from "@/types/gigs";

const base = "/gigs";

export interface ListGigsParams {
  platform?: GigPlatform;
  status?: GigStatus;
  archived?: boolean;
  search?: string;
  limit?: number;
  cursor?: string;
}

export interface ListGigsResponse {
  items: GigListItem[];
  nextCursor?: string | null;
}

export async function listGigs(params?: ListGigsParams): Promise<GigListItem[]> {
  const response = await api.get<ApiSuccess<GigListItem[] | ListGigsResponse>>(base, {
    params,
  });
  const data = response.data.data;
  if (Array.isArray(data)) return data;
  return data.items;
}

export async function getGig(id: string): Promise<Gig> {
  const response = await api.get<ApiSuccess<Gig>>(`${base}/${id}`);
  return response.data.data;
}

export async function createGig(input: GigInput): Promise<{ gigId: string }> {
  const response = await api.post<ApiSuccess<{ gigId: string }>>(base, input);
  return response.data.data;
}

export interface PatchGigBody {
  title?: string;
  archived?: boolean;
  content?: Partial<Gig["content"]>;
}

export async function patchGig(id: string, body: PatchGigBody): Promise<Gig> {
  const response = await api.patch<ApiSuccess<Gig>>(`${base}/${id}`, body);
  return response.data.data;
}

export async function deleteGig(id: string): Promise<void> {
  await api.delete(`${base}/${id}`);
}

export async function regenerateGig(id: string): Promise<{ gigId: string }> {
  const response = await api.post<ApiSuccess<{ gigId: string }>>(`${base}/${id}/regenerate`);
  return response.data.data;
}

export async function improveGigSection(
  id: string,
  section: ImproveSection,
  instructions?: string,
): Promise<ImproveResult> {
  const response = await api.post<ApiSuccess<ImproveResult>>(`${base}/${id}/improve`, {
    section,
    instructions,
  });
  return response.data.data;
}

export async function duplicateGig(id: string): Promise<{ gigId: string }> {
  const response = await api.post<ApiSuccess<{ gigId: string }>>(`${base}/${id}/duplicate`);
  return response.data.data;
}

export async function updateGigShare(id: string, enabled: boolean): Promise<ShareGigResult> {
  const response = await api.post<ApiSuccess<ShareGigResult>>(`${base}/${id}/share`, { enabled });
  return response.data.data;
}

export async function getPublicGig(slug: string): Promise<PublicGig> {
  const response = await api.get<ApiSuccess<PublicGig>>(`/public/gigs/${slug}`);
  return response.data.data;
}

export function exportGigUrl(id: string, format: "pdf" | "docx"): string {
  const baseURL = api.defaults.baseURL ?? "";
  return `${baseURL}${base}/${id}/export/${format}`;
}
