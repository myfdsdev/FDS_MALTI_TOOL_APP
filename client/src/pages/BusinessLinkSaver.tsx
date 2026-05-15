import * as React from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";
import {
  Check,
  CheckCircle2,
  Clipboard,
  Globe,
  History,
  Link2,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LinkPreviewCard } from "@/components/tools/LinkPreviewCard";
import { useGenerate } from "@/lib/queries";
import { useCreateNote, useListProjects } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { LinkPreview } from "@/types/business";

const HISTORY_KEY = "business.linkSaver.history";
const SAVED_KEY = "business.linkSaver.savedUrls";
const MAX_HISTORY = 20;

const EXAMPLE_URLS = [
  "https://anthropic.com",
  "https://github.com/anthropics/anthropic-sdk-typescript",
  "https://news.ycombinator.com",
];

interface HistoryEntry {
  id: string;
  preview: LinkPreview;
  savedAt: string;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persistJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function previewToMarkdown(preview: LinkPreview) {
  const lines: string[] = [
    `# ${preview.title}`,
    "",
    `**Source:** ${preview.siteName} — ${preview.url}`,
    "",
  ];
  if (preview.description) lines.push(preview.description, "");
  if (preview.image) lines.push(`![preview](${preview.image})`, "");
  return lines.join("\n");
}

export default function BusinessLinkSaver() {
  const reducedMotion = useReducedMotion();
  const generate = useGenerate("link-saver");
  const createNote = useCreateNote();
  const { data: projectsData } = useListProjects();
  const projects = projectsData?.items ?? [];

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [url, setUrl] = React.useState("");
  const [current, setCurrent] = React.useState<LinkPreview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>(() =>
    loadJson<HistoryEntry[]>(HISTORY_KEY, [])
  );
  const [savedUrls, setSavedUrls] = React.useState<string[]>(() =>
    loadJson<string[]>(SAVED_KEY, [])
  );
  const [savingNoteProject, setSavingNoteProject] = React.useState<string>("");
  const [historyQuery, setHistoryQuery] = React.useState("");

  React.useEffect(() => persistJson(HISTORY_KEY, history), [history]);
  React.useEffect(() => persistJson(SAVED_KEY, savedUrls), [savedUrls]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const savedSet = React.useMemo(() => new Set(savedUrls), [savedUrls]);
  const trimmedUrl = url.trim();
  const urlValid = isValidHttpUrl(trimmedUrl);
  const urlState: "empty" | "valid" | "invalid" =
    trimmedUrl.length === 0 ? "empty" : urlValid ? "valid" : "invalid";

  const filteredHistory = React.useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((entry) => {
      const { title, description, url: entryUrl } = entry.preview;
      return (
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        entryUrl.toLowerCase().includes(q)
      );
    });
  }, [history, historyQuery]);

  async function runPreview(target: string) {
    setError(null);
    setCurrent(null);
    try {
      const result = await generate.mutateAsync({ url: target });
      const preview = result.output as LinkPreview;
      setCurrent(preview);
      setHistory((prev) => {
        const dedup = prev.filter((entry) => entry.preview.url !== preview.url);
        return [
          { id: crypto.randomUUID(), preview, savedAt: new Date().toISOString() },
          ...dedup,
        ].slice(0, MAX_HISTORY);
      });
    } catch (err) {
      setError(extractErrorMessage(err, "We couldn't fetch a preview for that URL."));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!urlValid) return;
    await runPreview(trimmedUrl);
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) {
        toast.info("Clipboard is empty");
        return;
      }
      setUrl(trimmed);
      if (isValidHttpUrl(trimmed)) {
        await runPreview(trimmed);
      } else {
        toast.error("That doesn't look like a URL");
      }
    } catch {
      toast.error("Clipboard access was denied");
    }
  }

  async function handleSaveAsNote() {
    if (!current) return;
    try {
      await createNote.mutateAsync({
        projectId: savingNoteProject || undefined,
        title: current.title || hostnameOf(current.url),
        content: previewToMarkdown(current),
        pinned: false,
      });
      setSavedUrls((prev) => (prev.includes(current.url) ? prev : [...prev, current.url]));
      toast.success("Saved as note");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save that note"));
    }
  }

  function clearHistory() {
    setHistory([]);
    setHistoryQuery("");
  }

  function removeHistoryEntry(id: string) {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (urlValid) void runPreview(trimmedUrl);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Link2 className="size-3.5 text-primary" />
          Link Saver
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Preview & save any link</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste a URL and we&apos;ll fetch its title, description, and preview image. Save the best
          ones as project notes so you can find them later.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/article"
              className={cn(
                "h-12 pl-10 pr-12 text-base",
                urlState === "invalid" && "border-destructive focus-visible:ring-destructive/40",
                urlState === "valid" && "border-emerald-500/50"
              )}
              aria-invalid={urlState === "invalid"}
            />
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            {urlState === "valid" && (
              <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-500" />
            )}
            {urlState === "invalid" && (
              <XCircle className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handlePasteFromClipboard()}
            disabled={generate.isPending}
            className="h-12"
          >
            <Clipboard className="size-4" />
            Paste
          </Button>
          <Button
            type="submit"
            disabled={generate.isPending || !urlValid}
            className="h-12 sm:min-w-36"
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generate.isPending ? "Fetching..." : "Preview"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {urlState === "invalid"
            ? "Enter a full URL starting with http:// or https://"
            : "Tip: ⌘/Ctrl + Enter to fetch quickly."}
        </p>
      </form>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Result
          </h2>

          {generate.isPending ? (
            <LinkPreviewCard isLoading />
          ) : error ? (
            <LinkPreviewCard error={error} />
          ) : current ? (
            <div className="space-y-4">
              <LinkPreviewCard preview={current} />

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Save as note</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Stores the preview as a markdown note you can find under the Notes tab.
                    </p>
                  </div>
                  {savedSet.has(current.url) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Select
                    value={savingNoteProject}
                    onChange={(event) => setSavingNoteProject(event.target.value)}
                    className="sm:max-w-xs"
                  >
                    <option value="">No project (global)</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    onClick={() => void handleSaveAsNote()}
                    disabled={createNote.isPending}
                  >
                    {createNote.isPending
                      ? "Saving..."
                      : savedSet.has(current.url)
                        ? "Save again"
                        : "Save as note"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-6 py-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Link2 className="size-5" />
                </div>
                <p className="font-medium">Paste a URL above to fetch a preview</p>
                <p className="max-w-md text-xs text-muted-foreground">
                  Or try one of these to see how it works:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_URLS.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setUrl(example);
                        void runPreview(example);
                      }}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
                    >
                      {hostnameOf(example)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <History className="size-4" />
              Recent
              {history.length > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {history.length}
                </span>
              )}
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {history.length > 0 && (
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                placeholder="Filter history"
                className="h-9 pl-9 text-sm"
              />
            </div>
          )}

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
              Your last {MAX_HISTORY} previews will appear here.
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              Nothing matches &ldquo;{historyQuery}&rdquo;.
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredHistory.map((entry, index) => {
                const hostname = hostnameOf(entry.preview.url);
                const isCurrent = current?.url === entry.preview.url;
                const isSaved = savedSet.has(entry.preview.url);
                return (
                  <motion.li
                    key={entry.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: reducedMotion ? 0 : index * 0.02 }}
                  >
                    <div
                      className={cn(
                        "group flex items-start gap-2 rounded-xl border bg-card p-3 transition-colors",
                        isCurrent
                          ? "border-primary"
                          : "border-border hover:border-border/80"
                      )}
                    >
                      <HistoryFavicon preview={entry.preview} />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrent(entry.preview);
                          setUrl(entry.preview.url);
                          setError(null);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium">
                            {entry.preview.title || hostname}
                          </p>
                          {isSaved && (
                            <CheckCircle2
                              className="size-3.5 shrink-0 text-emerald-500"
                              aria-label="Saved as note"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{hostname}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHistoryEntry(entry.id)}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus:opacity-100"
                        aria-label="Remove from history"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}

function HistoryFavicon({ preview }: { preview: LinkPreview }) {
  const [failed, setFailed] = React.useState(false);
  if (preview.favicon && !failed) {
    return (
      <img
        src={preview.favicon}
        alt=""
        className="mt-0.5 size-5 shrink-0 rounded-sm"
        onError={() => setFailed(true)}
      />
    );
  }
  return <Globe className="mt-0.5 size-5 shrink-0 text-muted-foreground" />;
}
