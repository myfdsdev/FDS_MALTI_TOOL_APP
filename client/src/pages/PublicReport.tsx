import { Link, useParams } from "react-router-dom";
import { AlertCircle, LineChart, Loader2 } from "lucide-react";
import { usePublicReport } from "@/lib/reports.queries";
import { ReportViewer } from "@/components/business/reports/viewer/ReportViewer";
import type { Report } from "@/types/reports";

export default function PublicReport() {
  const { slug } = useParams<{ slug: string }>();
  const { data: publicReport, isLoading, isError } = usePublicReport(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading report…
        </div>
      </div>
    );
  }

  if (isError || !publicReport) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-lg font-semibold">Report not found</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This link may have been disabled or never existed.
        </p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  // Shape into a Report-ish object for the viewer (read-only mode).
  const viewerReport: Report = {
    _id: "public",
    user: "",
    websiteUrl: publicReport.websiteUrl,
    hostname: publicReport.hostname,
    snapshot: publicReport.snapshot,
    content: publicReport.content,
    status: publicReport.status,
    statusStage: publicReport.statusStage,
    error: null,
    generatedBy: publicReport.generatedBy,
    generationMs: null,
    share: { enabled: true, slug: slug ?? null, viewCount: publicReport.share.viewCount },
    createdAt: publicReport.createdAt,
    updatedAt: publicReport.createdAt,
  };

  if (!publicReport.content) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
        <p className="text-lg font-semibold">Report still generating</p>
        <p className="max-w-md text-sm text-muted-foreground">Check back in a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <LineChart className="size-4 text-primary" />
            <p className="truncate text-sm font-semibold">
              {publicReport.hostname || publicReport.websiteUrl}
            </p>
          </div>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Made with Multi-Tool AI SaaS — Generate yours free
          </Link>
        </div>
      </header>

      <ReportViewer report={viewerReport} readOnly />
    </div>
  );
}
