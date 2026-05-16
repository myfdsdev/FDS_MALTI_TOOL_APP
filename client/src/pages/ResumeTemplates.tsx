import { Sparkles } from "lucide-react";
import { TemplateGallery } from "@/components/resume/TemplateGallery";

export default function ResumeTemplates() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Templates
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Resume templates</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each template renders the same data — pick whichever fits the role you're applying for.
        </p>
      </header>

      <TemplateGallery />
    </div>
  );
}
