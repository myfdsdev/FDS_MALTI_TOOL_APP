import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/business/reports/viewer/ProgressIndicator";
import { ReportViewer } from "@/components/business/reports/viewer/ReportViewer";
import { useReport, useRetryReport } from "@/lib/reports.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export default function ReportViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, isError } = useReport(id);
  const retry = useRetryReport();

  if (isLoading) {
    return (
      <div>
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <div className="h-44 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <AlertTriangle className="mx-auto size-8 text-destructive" />
          <p className="mt-3 text-lg font-semibold">Report not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This report doesn't exist or you don't have access.
          </p>
          <Link
            to="/business/reports"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Back to reports
          </Link>
        </div>
      </div>
    );
  }

  if (report.status === "queued" || report.status === "processing") {
    return (
      <div>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 md:px-8">
          <p className="text-sm text-muted-foreground">
            Analyzing {report.hostname || report.websiteUrl}
          </p>
          <ProgressIndicator stage={report.statusStage} />
          <button
            type="button"
            onClick={() => navigate("/business/reports")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel (generation continues in the background)
          </button>
        </div>
      </div>
    );
  }

  if (report.status === "failed") {
    const handleRetry = async () => {
      try {
        await retry.mutateAsync(report._id);
        toast.success("Retry queued");
      } catch (err) {
        toast.error(extractErrorMessage(err, "Couldn't retry"));
      }
    };

    return (
      <div>
        <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
          <Card>
            <CardContent className="space-y-4 px-6 py-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">Report failed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {report.error || "Something went wrong while analyzing this site."}
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Link to="/business/reports" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent">
                  Back to reports
                </Link>
                <Button type="button" size="sm" onClick={() => void handleRetry()} disabled={retry.isPending}>
                  <RefreshCw className="size-3.5" /> Re-run report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ReportViewer report={report} />
    </div>
  );
}
