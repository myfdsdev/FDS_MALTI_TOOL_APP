import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Share2, Sparkles, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportStatusPill } from "@/components/business/reports/ReportStatusPill";
import { ReportExportMenu } from "@/components/business/reports/ReportExportMenu";
import { ReportShareDialog } from "@/components/business/reports/ReportShareDialog";
import { useDeleteReport, useRetryReport } from "@/lib/reports.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Report } from "@/types/reports";

interface Props {
  report: Report;
}

function faviconFor(host: string): string {
  if (!host) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export function ReportHeader({ report }: Props) {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const retry = useRetryReport();
  const del = useDeleteReport();

  const handleRetry = async () => {
    try {
      await retry.mutateAsync(report._id);
      toast.success("Re-running report…");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't retry"));
    }
  };

  const handleDelete = async () => {
    try {
      await del.mutateAsync(report._id);
      toast.success("Report deleted");
      navigate("/business/reports");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete report"));
    }
  };

  const title = report.content?.websiteTitle || report.hostname || report.websiteUrl;

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-8">
        <Link
          to="/business/reports"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All reports
        </Link>

        <div className="ml-2 flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {report.hostname ? (
              <img
                src={faviconFor(report.hostname)}
                alt=""
                className="size-5"
                onError={(ev) => {
                  (ev.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{report.websiteUrl}</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ReportStatusPill status={report.status} />
          {report.generatedBy === "ai" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="size-3" /> AI-generated
            </span>
          ) : report.generatedBy === "fallback" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Zap className="size-3" /> Quick report
            </span>
          ) : null}

          <Button type="button" size="sm" variant="outline" onClick={() => setShareOpen(true)}>
            <Share2 className="size-3.5" /> Share
          </Button>

          {report.content && (
            <ReportExportMenu content={report.content} websiteUrl={report.websiteUrl} />
          )}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleRetry()}
            disabled={retry.isPending || report.status === "queued" || report.status === "processing"}
            title="Re-run report"
          >
            <RefreshCw className="size-3.5" /> Re-run
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete report"
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      <ReportShareDialog
        reportId={report._id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        initialEnabled={report.share.enabled}
        initialSlug={report.share.slug}
        viewCount={report.share.viewCount}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-[min(420px,90vw)] space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xl">
            <p className="text-sm font-semibold">Delete this report?</p>
            <p className="text-xs text-muted-foreground">This permanently removes the report and disables any share link.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleDelete()}
                disabled={del.isPending}
                className="bg-destructive text-destructive-foreground hover:opacity-90"
              >
                {del.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
