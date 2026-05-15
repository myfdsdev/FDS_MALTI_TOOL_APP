import * as React from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { FileText, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useCreateNote,
  useDeleteNote,
  useListNotes,
  useListProjects,
  useUpdateNote,
} from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import { NoteDialog, type NoteDialogValues } from "@/components/business/NoteDialog";
import type { Note } from "@/types/business";

type SaveState = "idle" | "dirty" | "saving" | "saved";

export default function BusinessNotes() {
  const { data: notes = [] } = useListNotes();
  const { data: projectsData } = useListProjects();
  const projects = projectsData?.items ?? [];
  const createNote = useCreateNote();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftContent, setDraftContent] = React.useState("");
  const [draftPinned, setDraftPinned] = React.useState(false);
  const [draftProjectId, setDraftProjectId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState(false);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filterProjectId, setFilterProjectId] = React.useState<string>("all");

  const projectNameById = React.useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    for (const project of projects) {
      map.set(project._id, { name: project.name, color: project.color });
    }
    return map;
  }, [projects]);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (filterProjectId === "none" && note.project) return false;
      if (filterProjectId !== "all" && filterProjectId !== "none" && note.project !== filterProjectId) {
        return false;
      }
      if (!normalized) return true;
      return (
        note.title.toLowerCase().includes(normalized) ||
        note.content.toLowerCase().includes(normalized)
      );
    });
  }, [filterProjectId, notes, query]);

  const selectedNote: Note | null = React.useMemo(
    () => filtered.find((note) => note._id === selectedId) ?? null,
    [filtered, selectedId]
  );

  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0]._id);
    } else if (selectedId && !filtered.some((note) => note._id === selectedId)) {
      setSelectedId(filtered[0]?._id ?? null);
    }
  }, [filtered, selectedId]);

  React.useEffect(() => {
    if (!selectedNote) return;
    setDraftTitle(selectedNote.title);
    setDraftContent(selectedNote.content);
    setDraftPinned(selectedNote.pinned);
    setDraftProjectId(selectedNote.project);
    setSaveState("idle");
  }, [selectedNote?._id]);

  const updateNote = useUpdateNote(selectedNote?._id ?? "");
  const deleteNote = useDeleteNote(selectedNote?._id ?? "");

  React.useEffect(() => {
    if (!selectedNote) return;
    const changed =
      draftTitle !== selectedNote.title ||
      draftContent !== selectedNote.content ||
      draftPinned !== selectedNote.pinned;

    if (!changed) {
      setSaveState("saved");
      return;
    }

    setSaveState("dirty");
    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        await updateNote.mutateAsync({
          title: draftTitle,
          content: draftContent,
          pinned: draftPinned,
        });
        setSaveState("saved");
      } catch (error) {
        setSaveState("dirty");
        toast.error(extractErrorMessage(error, "Couldn't save that note"));
      }
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [draftContent, draftPinned, draftTitle, selectedNote, updateNote]);

  React.useEffect(() => {
    if (saveState !== "dirty" && saveState !== "saving") return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  async function handleCreate(values: NoteDialogValues) {
    try {
      const created = await createNote.mutateAsync({
        title: values.title,
        content: values.content,
        pinned: values.pinned,
      });
      setSelectedId(created._id);
      toast.success("Note created");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't create that note"));
      throw error;
    }
  }

  async function handleDelete() {
    if (!selectedNote) return;
    try {
      await deleteNote.mutateAsync();
      const next = filtered.find((note) => note._id !== selectedNote._id);
      setSelectedId(next?._id ?? null);
      toast.success("Note deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete that note"));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <FileText className="size-3.5 text-primary" />
            All notes
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Search across projects, pin what matters, and capture decisions in markdown.
          </p>
        </div>

        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New note
        </Button>
      </header>

      <div className="mt-8 grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card">
          <div className="space-y-3 border-b border-border px-4 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or content"
                className="pl-9"
              />
            </div>
            <Select
              value={filterProjectId}
              onChange={(event) => setFilterProjectId(event.target.value)}
            >
              <option value="all">All projects</option>
              <option value="none">No project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="max-h-[36rem] overflow-y-auto p-2">
            {filtered.map((note) => {
              const projectMeta = note.project ? projectNameById.get(note.project) : null;
              return (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => setSelectedId(note._id)}
                  className={`mb-2 w-full rounded-xl border px-3 py-3 text-left ${
                    selectedId === note._id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-accent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{note.title || "Untitled note"}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {note.content || "No content yet"}
                      </p>
                    </div>
                    {note.pinned && <Pin className="mt-0.5 size-4 text-primary" />}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    {projectMeta ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: projectMeta.color }}
                          aria-hidden="true"
                        />
                        {projectMeta.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">No project</span>
                    )}
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                {query ? "No notes match your search." : "No notes yet — create one to start."}
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-border bg-card">
          {selectedNote ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftPinned((current) => !current)}
                    className="rounded-md p-2 hover:bg-accent"
                    aria-label={draftPinned ? "Unpin note" : "Pin note"}
                  >
                    {draftPinned ? <Pin className="size-4 text-primary" /> : <PinOff className="size-4" />}
                  </button>
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="min-w-[14rem] bg-transparent text-lg font-semibold outline-none"
                    placeholder="Untitled note"
                  />
                  {draftProjectId && projectNameById.get(draftProjectId) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: projectNameById.get(draftProjectId)!.color }}
                        aria-hidden="true"
                      />
                      {projectNameById.get(draftProjectId)!.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreview((current) => !current)}
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
                  >
                    {preview ? "Edit" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    className="rounded-md border border-destructive/20 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-1 inline size-4" />
                    Delete
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {saveState === "dirty"
                      ? "Unsaved changes"
                      : saveState === "saving"
                        ? "Saving..."
                        : saveState === "saved"
                          ? "Saved"
                          : ""}
                  </span>
                </div>
              </div>

              <div className="p-4">
                {preview ? (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{draftContent || "_Nothing to preview yet._"}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    className="min-h-[26rem] w-full resize-none bg-transparent text-sm leading-6 outline-none"
                    placeholder="Write in Markdown..."
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <FileText className="size-8" />
              <p>Select a note on the left or create a new one to get started.</p>
            </div>
          )}
        </section>
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isPending={createNote.isPending}
        onSubmit={handleCreate}
      />
    </div>
  );
}
