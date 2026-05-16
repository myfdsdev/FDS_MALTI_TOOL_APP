import { api } from "./api";
import type { ApiSuccess } from "@/types/api";
import type {
  PublicReport,
  Report,
  ReportListItem,
  ReportStatus,
  ShareReportResult,
} from "@/types/reports";

const base = "/business/reports";

export async function listReports(status?: ReportStatus): Promise<ReportListItem[]> {
  const response = await api.get<ApiSuccess<ReportListItem[]>>(base, {
    params: status ? { status } : undefined,
  });
  return response.data.data;
}

export async function getReport(id: string): Promise<Report> {
  const response = await api.get<ApiSuccess<Report>>(`${base}/${id}`);
  return response.data.data;
}

export async function createReport(url: string): Promise<{ reportId: string }> {
  const response = await api.post<ApiSuccess<{ reportId: string }>>(base, { url });
  return response.data.data;
}

export async function retryReport(id: string): Promise<{ reportId: string }> {
  const response = await api.post<ApiSuccess<{ reportId: string }>>(`${base}/${id}/retry`);
  return response.data.data;
}

export async function deleteReport(id: string): Promise<void> {
  await api.delete(`${base}/${id}`);
}

export async function updateShare(id: string, enabled: boolean): Promise<ShareReportResult> {
  const response = await api.post<ApiSuccess<ShareReportResult>>(`${base}/${id}/share`, { enabled });
  return response.data.data;
}

export async function getPublicReport(slug: string): Promise<PublicReport> {
  const response = await api.get<ApiSuccess<PublicReport>>(`/public/reports/${slug}`);
  return response.data.data;
}
