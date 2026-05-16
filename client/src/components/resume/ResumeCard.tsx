import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, MoreVertical, Pencil, Share2, Trash2, FileUser } from "lucide-react";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDeleteResume, useDuplicateResume } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { ResumeListItem } from "@/types/resume";
import { TEMPLATE_LABELS } from "@/types/resume";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  resume: ResumeListItem;
  reducedMotion: boolean;
}

export function ResumeCard({ resume, reducedMotion }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeleteResume();
  const dup = useDuplicateResume();

  const handleDelete = async () => {
    try {
      await del.mutateAsync(resume._id);
      toast.success(`Deleted "${resume.title}"`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete that resume"));
    }
  };

  const handleDuplicate = async () => {
    try {
      const copy = await dup.mutateAsync(resume._id);
      toast.success("Duplicated");
      navigate(`/business/resumes/${copy._id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't duplicate"));
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: reducedMotion ? 0 : 8 }, show: { opacity: 1, y: 0 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <Link
        to={`/business/resumes/${resume._id}`}
        className="relative h-40 w-full"
        style={{
          background: `linear-gradient(135deg, ${resume.themeColor}1A 0%, ${resume.themeColor}33 100%)`,
        }}
      >
        <div
          className="absolute inset-x-3 top-3 h-1.5 rounded-full"
          style={{ backgroundColor: resume.themeColor }}
        />
        <div className="flex h-full items-center justify-center">
          <FileUser className="size-12" style={{ color: resume.themeColor }} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/business/resumes/${resume._id}`} className="block">
              <p className="truncate font-semibold">{resume.title || "Untitled"}</p>
            </Link>
            <p className="text-xs text-muted-foreground">
              Edited {formatDistanceToNow(new Date(resume.lastEditedAt), { addSuffix: true })}
            </p>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus:opacity-100"
              >
                <MoreVertical className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1">
              <MenuItem
                onClick={() => {
                  setOpen(false);
                  navigate(`/business/resumes/${resume._id}`);
                }}
                icon={Pencil}
                label="Edit"
              />
              <MenuItem
                onClick={() => {
                  setOpen(false);
                  void handleDuplicate();
                }}
                icon={Copy}
                label="Duplicate"
              />
              {resume.share.enabled && (
                <MenuItem
                  onClick={() => {
                    setOpen(false);
                    navigate(`/business/resumes/${resume._id}`);
                  }}
                  icon={Share2}
                  label="Share link"
                />
              )}
              <MenuItem
                onClick={() => {
                  setOpen(false);
                  setConfirmDelete(true);
                }}
                icon={Trash2}
                label="Delete"
                danger
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2 text-xs">
          <span
            className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground"
          >
            {TEMPLATE_LABELS[resume.template]}
          </span>
          {resume.atsScore !== null && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
                resume.atsScore >= 75
                  ? "bg-emerald-100 text-emerald-700"
                  : resume.atsScore >= 50
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              )}
            >
              ATS {resume.atsScore}
            </span>
          )}
          {resume.share.enabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-sky-700">
              <Share2 className="size-3" /> Public
            </span>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-card/95 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-lg">
            <p className="text-sm font-medium">Delete "{resume.title}"?</p>
            <p className="text-xs text-muted-foreground">This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-3 py-1.5 text-xs hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={del.isPending}
                onClick={() => void handleDelete()}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {del.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-accent"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
