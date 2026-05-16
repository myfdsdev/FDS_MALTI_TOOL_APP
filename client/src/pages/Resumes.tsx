import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FileDown,
  FileText,
  FileUser,
  Plus,
  Share2,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { TemplateGallery } from "@/components/resume/TemplateGallery";
import { useResumes } from "@/lib/resume.queries";
import type { ResumeListItem } from "@/types/resume";

export default function Resumes() {
  const reducedMotion = useReducedMotion();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { data: resumes = [], isLoading } = useResumes();
  const latestResume = resumes[0];
  const stats = useMemo(() => getResumeStats(resumes), [resumes]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileUser className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Resume workshop</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Build and manage resumes
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Start from a template, improve sections with AI, export PDF or DOCX, and keep every version organized.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
          <HeaderMetric label="Resumes" value={String(resumes.length)} />
          <HeaderMetric label="Shared" value={String(stats.shared)} />
          <HeaderMetric label="Best ATS" value={stats.bestAts === null ? "--" : String(stats.bestAts)} />
        </div>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Start with a template</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Choose a layout first, then fill it manually or use AI inside the builder to draft and polish sections.
                </p>
              </div>
            </div>

            <Button type="button" onClick={() => setGalleryOpen(true)} className="shrink-0">
              <Plus className="size-4" />
              New resume
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <FeaturePill icon={FileText} label="6 templates" />
            <FeaturePill icon={BadgeCheck} label="ATS checks" />
            <FeaturePill icon={FileDown} label="PDF and DOCX" />
          </div>
        </div>

        <LatestResumeCard resume={latestResume} onCreate={() => setGalleryOpen(true)} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your resumes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {resumes.length === 0
                ? "No resumes yet. Create one from a template to begin."
                : `${resumes.length} saved resume${resumes.length === 1 ? "" : "s"} in your workspace.`}
            </p>
          </div>
          {resumes.length > 0 && (
            <Button type="button" variant="outline" onClick={() => setGalleryOpen(true)}>
              <Plus className="size-4" />
              New resume
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-[16rem_minmax(0,1fr)] md:items-center">
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <FileUser className="size-14 text-primary" />
              </div>
              <div className="max-w-xl">
                <p className="text-xl font-semibold">Create your first resume</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick a template, add your details, and let AI help with summaries, bullets, skills, and ATS checks.
                </p>
                <Button type="button" onClick={() => setGalleryOpen(true)} className="mt-5">
                  <Sparkles className="size-4" />
                  Choose template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: reducedMotion ? 0 : 0.04 } },
            }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </motion.div>
        )}
      </section>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="w-[min(96vw,72rem)]">
          <DialogHeader>
            <DialogTitle>Choose a resume template</DialogTitle>
            <DialogDescription>
              Create a resume from any template. You can change the design later inside the builder.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <TemplateGallery onCreated={() => setGalleryOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm">
      <Icon className="size-4 text-primary" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

function LatestResumeCard({
  resume,
  onCreate,
}: {
  resume?: ResumeListItem;
  onCreate: () => void;
}) {
  if (!resume) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileUser className="size-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold tracking-tight">No active resume yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create one from a template and it will appear here for quick editing.
        </p>
        <Button type="button" variant="outline" onClick={onCreate} className="mt-5 w-full">
          Choose template
        </Button>
      </div>
    );
  }

  return (
    <Link
      to={`/business/resumes/${resume._id}`}
      className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileUser className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase text-muted-foreground">Continue editing</p>
      <h2 className="mt-1 truncate text-base font-semibold tracking-tight">{resume.title || "Untitled resume"}</h2>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {resume.atsScore !== null && (
          <span className="rounded-full bg-muted px-2 py-1">ATS {resume.atsScore}</span>
        )}
        {resume.share.enabled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <Share2 className="size-3" />
            Shared
          </span>
        )}
      </div>
    </Link>
  );
}

function getResumeStats(resumes: ResumeListItem[]) {
  const shared = resumes.filter((resume) => resume.share.enabled).length;
  const scores = resumes
    .map((resume) => resume.atsScore)
    .filter((score): score is number => typeof score === "number");

  return {
    shared,
    bestAts: scores.length ? Math.max(...scores) : null,
  };
}
