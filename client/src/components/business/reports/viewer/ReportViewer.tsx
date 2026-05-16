import { motion, useReducedMotion } from "motion/react";
import { Building2, Users, Tag } from "lucide-react";
import { ReportHeader } from "./ReportHeader";
import { ScoresPanel } from "./ScoresPanel";
import { MonetizationStrategy } from "./MonetizationStrategy";
import { StreamsTable } from "./StreamsTable";
import { SectionsAccordion } from "./SectionsAccordion";
import { RecommendationsList } from "./RecommendationsList";
import type { Report } from "@/types/reports";

interface Props {
  report: Report;
  readOnly?: boolean;
}

export function ReportViewer({ report, readOnly = false }: Props) {
  const reduced = useReducedMotion();
  const content = report.content;
  if (!content) return null;

  return (
    <>
      {!readOnly && <ReportHeader report={report} />}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.06 } } }}
        className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              We identified this as
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
              <span className="text-primary">{content.detectedGenre || "—"}</span>
              {" "}
              <span className="text-muted-foreground">serving</span>
              {" "}
              <span className="text-primary">{content.audience || "your audience"}</span>
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{content.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Chip icon={Tag} label="Genre" value={content.detectedGenre} />
              <Chip icon={Building2} label="Industry" value={content.industry} />
              <Chip icon={Users} label="Audience" value={content.audience} />
            </div>
          </div>

          <ScoresPanel scores={content.scores} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <MonetizationStrategy strategy={content.monetizationStrategy} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <StreamsTable streams={content.monetizationStreams} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <SectionsAccordion sections={content.sections} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <RecommendationsList recommendations={content.topRecommendations} />
        </motion.div>
      </motion.div>
    </>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground">
      <Icon className="size-3" />
      <span className="text-foreground/80">{label}:</span>
      <span>{value}</span>
    </span>
  );
}
