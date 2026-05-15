import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateNote,
  useDeleteNote,
  useListNotes,
  useUpdateNote,
} from "@/lib/business.queries";
import { extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { NoteDialog, type NoteDialogValues } from "../NoteDialog";

type SaveState = "idle" | "dirty" | "saving" | "saved";

export function NotesView({ projectId }: { projectId: string }) {
  const { data: notes = [] } = useListNotes({ projectId });
  const createNote = useCreateNote();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftContent, setDraftContent] = React.useState("");
  const [draftPinned, setDraftPinned] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const selectedNote = React.useMemo(
    () => notes.find((note) => note._id === selectedId) ?? null,
    [notes, selectedId]
  );

  React.useEffect(() => {
    if (!selectedId && notes.length > 0) {
      setSelectedId(notes[0]._id);
    }
  }, [notes, selectedId]);

  React.useEffect(() => {
    if (!selectedNote) return;
    setDraftTitle(selectedNote.title);
    setDraftContent(selectedNote.content);
    setDraftPinned(selectedNote.pinned);
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
        projectId,
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
      setSelectedId(notes.find((note) => note._id !== selectedNote._id)?._id ?? null);
      toast.success("Note deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete that note"));
    }
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div>
              <p className="font-semibold">Project notes</p>
              <p className="text-xs text-muted-foreground">Pinned notes stay on top.</p>
            </div>
            <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              New
            </Button>
          </div>

          <div className="max-h-[36rem] overflow-y-auto p-2">
            {notes.map((note) => (
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
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleString()}
                </p>
              </button>
            ))}

            {notes.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                No notes yet. Create one to capture decisions or project context.
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
            <div className="flex min-h-[24rem] items-center justify-center p-8 text-center text-muted-foreground">
              Select a note on the left or create a new one to get started.
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
    </>
  );
}
