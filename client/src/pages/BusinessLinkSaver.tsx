import * as React from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";
import { History, Link2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LinkPreviewCard } from "@/components/tools/LinkPreviewCard";
import { useGenerate } from "@/lib/queries";
import { useCreateNote, useListNotes, useListProjects } from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import type { LinkPreview } from "@/types/business";

const STORAGE_KEY = "business.linkSaver.history";
const MAX_HISTORY = 12;

interface HistoryEntry {
  id: string;
  preview: LinkPreview;
  savedAt: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* quota or privacy mode — ignore */
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
  const { data: allNotes = [] } = useListNotes();
  const projects = projectsData?.items ?? [];

  const [url, setUrl] = React.useState("");
  const [current, setCurrent] = React.useState<LinkPreview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>(() => loadHistory());
  const [savingNoteProject, setSavingNoteProject] = React.useState<string>("");

  React.useEffect(() => {
    saveHistory(history);
  }, [history]);

  const savedNoteUrls = React.useMemo(() => {
    const urls = new Set<string>();
    for (const note of allNotes) {
      const match = note.content.match(/\*\*Source:\*\*\s.+?—\s(\S+)/);
      if (match) urls.add(match[1]);
    }
    return urls;
  }, [allNotes]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    setCurrent(null);

    try {
      const result = await generate.mutateAsync({ url: trimmed });
      const preview = result.output as LinkPreview;
      setCurrent(preview);
      setHistory((prev) => {
        const dedup = prev.filter((entry) => entry.preview.url !== preview.url);
        return [{ id: crypto.randomUUID(), preview, savedAt: new Date().toISOString() }, ...dedup].slice(
          0,
          MAX_HISTORY
        );
      });
    } catch (err) {
      setError(extractErrorMessage(err, "We couldn't fetch a preview for that URL."));
    }
  }

  async function handleSaveAsNote() {
    if (!current) return;
    try {
      await createNote.mutateAsync({
        projectId: savingNoteProject || undefined,
        title: current.title || new URL(current.url).hostname,
        content: previewToMarkdown(current),
        pinned: false,
      });
      toast.success("Saved as note");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save that note"));
    }
  }

  function clearHistory() {
    setHistory([]);
  }

  function removeHistoryEntry(id: string) {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Link2 className="size-3.5 text-primary" />
          Link Saver
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Preview & save any link</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste a URL and we&apos;ll fetch its title, description, and preview image. Save the best ones as
          project notes for later.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/article"
          className="flex-1"
        />
        <Button type="submit" disabled={generate.isPending}>
          <Sparkles className="size-4" />
          {generate.isPending ? "Fetching..." : "Preview"}
        </Button>
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
                <p className="text-sm font-medium">Save as note</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stores the preview as a markdown note you can find under the Notes tab.
                </p>
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
                    {createNote.isPending ? "Saving..." : savedNoteUrls.has(current.url) ? "Save again" : "Save as note"}
                  </Button>
                </div>
                {savedNoteUrls.has(current.url) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    You&apos;ve already saved this link to a note.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
              Paste a URL above to fetch a preview.
            </div>
          )}
        </div>

        <aside>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <History className="size-4" />
              Recent
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
              Your last {MAX_HISTORY} previews will appear here.
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((entry, index) => {
                const hostname = (() => {
                  try {
                    return new URL(entry.preview.url).hostname.replace(/^www\./, "");
                  } catch {
                    return entry.preview.url;
                  }
                })();
                return (
                  <motion.li
                    key={entry.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: reducedMotion ? 0 : index * 0.02 }}
                  >
                    <div className="group flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrent(entry.preview);
                          setUrl(entry.preview.url);
                          setError(null);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium">
                          {entry.preview.title || hostname}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{hostname}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHistoryEntry(entry.id)}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
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
