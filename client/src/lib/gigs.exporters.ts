import { api } from "./api";

function safeFilename(value: string, ext: string): string {
  const cleaned = (value || "gig")
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "gig";
  return `${cleaned}.${ext}`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadStream(path: string, filename: string): Promise<void> {
  const response = await api.get<Blob>(path, { responseType: "blob" });
  triggerBlobDownload(response.data, filename);
}

export async function exportGigPdf(id: string, title: string): Promise<void> {
  await downloadStream(`/gigs/${id}/export/pdf`, safeFilename(title, "pdf"));
}

export async function exportGigDocx(id: string, title: string): Promise<void> {
  await downloadStream(`/gigs/${id}/export/docx`, safeFilename(title, "docx"));
}
