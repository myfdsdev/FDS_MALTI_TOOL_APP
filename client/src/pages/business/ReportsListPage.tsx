import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { LineChart, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCard } from "@/components/business/reports/ReportCard";
import { useReports } from "@/lib/reports.queries";

export default function ReportsListPage() {
  const reducedMotion = useReducedMotion();
  const { data: reports = [], isLoading } = useReports();

  const completed = reports.filter((r) => r.status === "completed");
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) /
            completed.length
        )
      : 0;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <LineChart className="size-3.5 text-primary" />
              Growth reports
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Growth Reports</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              AI-powered monetization reports for any public website. Paste a URL, get a tailored
              growth plan with revenue streams, scores, and 12 detailed sections.
            </p>
          </div>

          <Link
            to="/business/reports/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> New report
          </Link>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Total reports" value={String(reports.length)} />
          <Stat label="Completed" value={String(completed.length)} />
          <Stat label="Avg overall score" value={completed.length ? String(avgScore) : "—"} />
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <LineChart className="size-8" />
                </div>
                <div>
                  <p className="text-xl font-semibold">Run your first growth report</p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Paste any public website URL and we'll generate a monetization report with
                    revenue streams, scores, and a 12-section growth plan.
                  </p>
                </div>
                <Link
                  to="/business/reports/new"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                >
                  <Plus className="size-4" /> New report
                </Link>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: reducedMotion ? 0 : 0.04 } } }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {reports.map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  reducedMotion={Boolean(reducedMotion)}
                />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-3">
        <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
