import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SECTION_LABELS, SECTION_ORDER, SECTION_SUBTITLES } from "@/types/reports";
import type { ReportSections } from "@/types/reports";
import { cn } from "@/lib/utils";

interface Props {
  sections: ReportSections;
}

export function SectionsAccordion({ sections }: Props) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set([SECTION_ORDER[0]]));

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Detailed analysis</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          12 sections covering every angle of the monetization opportunity.
        </p>
      </header>
      <ul className="divide-y divide-border">
        {SECTION_ORDER.map((key) => {
          const isOpen = openKeys.has(key);
          const body = sections[key] || "";
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{SECTION_LABELS[key]}</p>
                  <p className="text-xs text-muted-foreground">{SECTION_SUBTITLES[key]}</p>
                </div>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p
                      className="max-w-[65ch] whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-foreground/90"
                    >
                      {body || "—"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
