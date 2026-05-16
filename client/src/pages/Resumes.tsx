import { useState } from "react";
import { FileUser, Plus } from "lucide-react";
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

export default function Resumes() {
  const reducedMotion = useReducedMotion();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { data: resumes = [], isLoading } = useResumes();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <FileUser className="size-3.5 text-primary" />
            Resume builder
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">My resumes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Build, polish, and share AI-powered resumes. Each resume can be exported as PDF or DOCX.
          </p>
        </div>

        <Button type="button" onClick={() => setGalleryOpen(true)}>
          <Plus className="size-4" /> New resume
        </Button>
      </header>

      <section className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileUser className="size-8" />
              </div>
              <div>
                <p className="text-xl font-semibold">Create your first resume</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Pick a template, paste a short bio, and let AI draft a full resume you can edit and export.
                </p>
              </div>
              <Button type="button" onClick={() => setGalleryOpen(true)}>
                Browse templates
              </Button>
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
            <DialogTitle>Pick a template</DialogTitle>
            <DialogDescription>
              You can change the template at any time from inside the builder.
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
