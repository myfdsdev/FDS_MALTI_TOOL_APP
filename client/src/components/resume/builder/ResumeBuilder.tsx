import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Eye, EyeOff, PencilLine, Sparkles } from "lucide-react";
import { BuilderSidebar } from "./BuilderSidebar";
import { BuilderToolbar } from "./BuilderToolbar";
import { LivePreview } from "./LivePreview";
import { PersonalSection } from "./sections/PersonalSection";
import { SummarySection } from "./sections/SummarySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { AwardsSection } from "./sections/AwardsSection";
import { StarterFillDialog } from "@/components/resume/ai/StarterFillDialog";
import { ATSCheckPanel } from "@/components/resume/ai/ATSCheckPanel";
import { ShareDialog } from "@/components/resume/ShareDialog";
import { useUpdateResume } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SECTION_LABELS } from "@/types/resume";
import type {
  Resume,
  SectionKey,
} from "@/types/resume";

const SECTION_ORDER: (SectionKey | "personal")[] = [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
  "awards",
];

const AUTOSAVE_DELAY = 800;

interface Props {
  resume: Resume;
}

export function ResumeBuilder({ resume }: Props) {
  const methods = useForm<Resume>({
    defaultValues: resume,
    shouldUnregister: false,
  });
  const update = useUpdateResume(resume._id);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeSection, setActiveSection] = useState<SectionKey | "personal">("personal");
  const [starterOpen, setStarterOpen] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const lastSnapshotRef = useRef<string>(JSON.stringify(resume));
  const saveQueueRef = useRef<Resume | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset the form whenever the resume id changes OR the server sends an updated
  // copy (e.g. after AI starter-fill). Otherwise leave the user's edits alone.
  const hydrationKeyRef = useRef<string>(resume._id);
  useEffect(() => {
    if (resume._id !== hydrationKeyRef.current) {
      hydrationKeyRef.current = resume._id;
      methods.reset(resume);
      lastSnapshotRef.current = JSON.stringify(resume);
    }
  }, [resume._id, resume, methods]);

  // When the cached resume changes from outside (AI starter-fill), re-sync.
  useEffect(() => {
    const snap = JSON.stringify(resume);
    if (snap !== lastSnapshotRef.current && resume._id === hydrationKeyRef.current) {
      methods.reset(resume);
      lastSnapshotRef.current = snap;
    }
  }, [resume, methods]);

  const flush = useCallback(async () => {
    const queued = saveQueueRef.current;
    if (!queued) return;
    saveQueueRef.current = null;
    inFlightRef.current = true;
    setSaveStatus("saving");
    try {
      await update.mutateAsync({
        title: queued.title,
        template: queued.template,
        themeColor: queued.themeColor,
        fontFamily: queued.fontFamily,
        content: queued.content,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 1800);
    } catch (err) {
      setSaveStatus("error");
      toast.error(extractErrorMessage(err, "Couldn't save changes"));
    } finally {
      inFlightRef.current = false;
      // If a save was queued while we were in-flight, run again.
      if (saveQueueRef.current) {
        void flush();
      }
    }
  }, [update]);

  // Subscribe to form changes for autosave
  useEffect(() => {
    const subscription = methods.watch((value) => {
      const snap = JSON.stringify(value);
      if (snap === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snap;

      saveQueueRef.current = value as Resume;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!inFlightRef.current) void flush();
      }, AUTOSAVE_DELAY);
    });
    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [methods, flush]);

  const retrySave = () => {
    saveQueueRef.current = methods.getValues() as Resume;
    void flush();
  };

  const hiddenSections = (methods.watch("content.hiddenSections") ?? []) as SectionKey[];

  const onToggleHidden = (key: SectionKey) => {
    const current = methods.getValues("content.hiddenSections") ?? [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    methods.setValue("content.hiddenSections", next, { shouldDirty: true });
  };

  // Scroll spy
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  useEffect(() => {
    const handler = () => {
      let current: SectionKey | "personal" = "personal";
      for (const key of SECTION_ORDER) {
        const el = sectionRefs.current.get(key);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - 160 <= 0) current = key;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const onJump = (key: SectionKey | "personal") => {
    const el = sectionRefs.current.get(key);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    }
  };

  const watched = methods.watch();

  const preview = useMemo(
    () => ({
      content: watched.content,
      template: watched.template,
      themeColor: watched.themeColor,
      fontFamily: watched.fontFamily,
    }),
    [watched.content, watched.template, watched.themeColor, watched.fontFamily]
  );

  return (
    <FormProvider {...methods}>
      <BuilderToolbar
        resume={resume}
        title={watched.title || ""}
        onTitleChange={(t) => methods.setValue("title", t, { shouldDirty: true })}
        template={watched.template}
        onTemplateChange={(t) => methods.setValue("template", t, { shouldDirty: true })}
        themeColor={watched.themeColor}
        onThemeColorChange={(c) => methods.setValue("themeColor", c, { shouldDirty: true })}
        fontFamily={watched.fontFamily}
        onFontChange={(f) => methods.setValue("fontFamily", f, { shouldDirty: true })}
        saveStatus={saveStatus}
        onRetrySave={retrySave}
        onOpenStarter={() => setStarterOpen(true)}
        onOpenAts={() => setAtsOpen(true)}
        onOpenShare={() => setShareOpen(true)}
      />

      <main className="min-h-[calc(100vh-4rem)] bg-muted/25">
        <div className="mx-auto grid max-w-[1680px] gap-4 px-3 py-4 pb-24 sm:px-4 md:px-6 lg:grid-cols-[13rem_minmax(0,0.95fr)_minmax(34rem,1.2fr)] lg:gap-5 lg:py-6 lg:pb-8 xl:grid-cols-[14rem_minmax(29rem,0.9fr)_minmax(42rem,1.15fr)]">
          <BuilderSidebar
            active={activeSection}
            onJump={onJump}
            hiddenSections={hiddenSections}
            onToggleHidden={onToggleHidden}
          />

          <div
            className={cn(
              "min-w-0 space-y-4",
              mobileTab === "preview" && "hidden lg:block"
            )}
          >
            <StarterFillCallout onClick={() => setStarterOpen(true)} />
            {SECTION_ORDER.map((key, index) => (
              <FormSection
                key={key}
                sectionKey={key}
                sectionIndex={index + 1}
                title={key === "personal" ? "Personal" : SECTION_LABELS[key]}
                hidden={key !== "personal" && hiddenSections.includes(key)}
                onToggleHide={key === "personal" ? undefined : () => onToggleHidden(key)}
                ref={(el) => {
                  if (el) sectionRefs.current.set(key, el);
                  else sectionRefs.current.delete(key);
                }}
              >
                {key === "personal" && <PersonalSection resumeId={resume._id} />}
                {key === "summary" && <SummarySection resumeId={resume._id} />}
                {key === "experience" && <ExperienceSection resumeId={resume._id} />}
                {key === "education" && <EducationSection />}
                {key === "skills" && <SkillsSection resumeId={resume._id} />}
                {key === "projects" && <ProjectsSection resumeId={resume._id} />}
                {key === "certifications" && <CertificationsSection />}
                {key === "languages" && <LanguagesSection />}
                {key === "awards" && <AwardsSection />}
              </FormSection>
            ))}
          </div>

          <div
            className={cn(
              "min-w-0",
              mobileTab === "edit" && "hidden lg:block"
            )}
          >
            <div className="sticky top-[5.25rem] h-[calc(100vh-6.5rem)] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <LivePreview {...preview} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom tab */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium",
            mobileTab === "edit" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <PencilLine className="size-4" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-medium",
            mobileTab === "preview" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Eye className="size-4" /> Preview
        </button>
      </div>

      <StarterFillDialog resumeId={resume._id} open={starterOpen} onOpenChange={setStarterOpen} />
      <ATSCheckPanel
        resumeId={resume._id}
        initial={{ score: resume.atsScore, issues: resume.atsIssues ?? [], suggestions: resume.atsSuggestions ?? [] }}
        open={atsOpen}
        onClose={() => setAtsOpen(false)}
      />
      <ShareDialog
        resumeId={resume._id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        initialEnabled={resume.share.enabled}
        initialSlug={resume.share.slug}
        viewCount={resume.share.viewCount}
      />
    </FormProvider>
  );
}

interface FormSectionProps {
  title: string;
  children: ReactNode;
  hidden?: boolean;
  onToggleHide?: () => void;
  sectionKey: string;
  sectionIndex: number;
}

const FormSection = forwardRef<HTMLElement, FormSectionProps>(function FormSection(
  { title, children, hidden, onToggleHide, sectionKey, sectionIndex },
  ref
) {
  return (
    <motion.section
      ref={ref}
      id={`section-${sectionKey}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background shadow-sm",
        hidden && "opacity-60"
      )}
    >
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {sectionIndex}
          </span>
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {onToggleHide && (
          <button
            type="button"
            onClick={onToggleHide}
            aria-label={hidden ? `Show ${title}` : `Hide ${title}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {hidden ? <><EyeOff className="size-3" /> Hidden</> : <><Eye className="size-3" /> Visible</>}
          </button>
        )}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </motion.section>
  );
});

function StarterFillCallout({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">AI resume starter</p>
          <p className="truncate text-xs text-muted-foreground">
            Draft the first version from a short bio.
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
        Start
      </span>
    </button>
  );
}
