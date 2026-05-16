import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, AlertTriangle, Info, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiAtsCheck } from "@/lib/resume.queries";
import type { ATSCheckResult } from "@/types/resume";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  resumeId: string;
  initial?: { score: number | null; issues: ATSCheckResult["issues"]; suggestions: string[] };
  open: boolean;
  onClose: () => void;
}

export function ATSCheckPanel({ resumeId, initial, open, onClose }: Props) {
  const [result, setResult] = useState<ATSCheckResult | null>(
    initial && initial.score !== null
      ? { score: initial.score, issues: initial.issues, suggestions: initial.suggestions }
      : null
  );
  const check = useAiAtsCheck(resumeId);

  useEffect(() => {
    if (initial && initial.score !== null) {
      setResult({ score: initial.score, issues: initial.issues, suggestions: initial.suggestions });
    }
  }, [initial?.score, initial?.issues, initial?.suggestions, initial]);

  const runCheck = async () => {
    try {
      const r = await check.mutateAsync();
      setResult(r);
    } catch (err) {
      toast.error(extractErrorMessage(err, "ATS check failed"));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/30"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(28rem,100vw)] flex-col border-l border-border bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-sm font-semibold">ATS check</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {!result && !check.isPending && (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Run an ATS check to score your resume out of 100 and surface issues.
                  </p>
                  <Button type="button" onClick={() => void runCheck()}>
                    Run ATS check
                  </Button>
                </div>
              )}

              {check.isPending && !result && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Auditing your resume…
                </p>
              )}

              {result && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-20 items-center justify-center rounded-full text-2xl font-bold",
                        result.score >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : result.score >= 50
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      )}
                    >
                      {result.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {result.score >= 75
                          ? "Looks strong"
                          : result.score >= 50
                            ? "Needs polish"
                            : "Many gaps"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Re-run after edits to track changes.
                      </p>
                    </div>
                  </div>

                  {result.issues.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Issues
                      </p>
                      <ul className="space-y-2">
                        {result.issues.map((issue, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 rounded-md border border-border bg-card p-2 text-xs"
                          >
                            <SeverityIcon severity={issue.severity} />
                            <div className="min-w-0">
                              <p className="text-sm">{issue.message}</p>
                              {issue.field && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  Field: {issue.field}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {result.suggestions.length > 0 && (
                    <section>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Suggestions
                      </p>
                      <ul className="space-y-2">
                        {result.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-border bg-card p-2 text-xs"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </div>

            <footer className="border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => void runCheck()}
                disabled={check.isPending}
              >
                {check.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Re-run check
              </Button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SeverityIcon({ severity }: { severity: "error" | "warning" | "info" }) {
  if (severity === "error") return <AlertCircle className="size-4 shrink-0 text-red-600" />;
  if (severity === "warning") return <AlertTriangle className="size-4 shrink-0 text-amber-600" />;
  return <Info className="size-4 shrink-0 text-sky-600" />;
}
