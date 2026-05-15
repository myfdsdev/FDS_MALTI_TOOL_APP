import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const noteSchema = z.object({
  title: z.string().trim().max(200),
  content: z.string().max(50000),
  pinned: z.boolean(),
});

export type NoteDialogValues = z.infer<typeof noteSchema>;

export function NoteDialog({
  open,
  onOpenChange,
  title = "New note",
  description = "Create a note for this project.",
  defaultValues,
  isPending = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  defaultValues?: Partial<NoteDialogValues>;
  isPending?: boolean;
  onSubmit: (values: NoteDialogValues) => Promise<void> | void;
}) {
  const form = useForm<NoteDialogValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      pinned: defaultValues?.pinned ?? false,
    },
  });

  React.useEffect(() => {
    form.reset({
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      pinned: defaultValues?.pinned ?? false,
    });
  }, [defaultValues, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          })}
          className="space-y-4 px-6 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input id="note-title" autoFocus {...form.register("title")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea id="note-content" className="min-h-28" {...form.register("content")} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("pinned")} />
            Pin this note
          </label>

          <DialogFooter className="px-0 pb-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
