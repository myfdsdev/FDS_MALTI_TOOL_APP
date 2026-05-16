import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileDown,
  Loader2,
  Palette,
  RefreshCw,
  Share2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  Resume,
  ResumeFontFamily,
  ResumeTemplate,
} from "@/types/resume";
import { FONT_LABELS, TEMPLATE_LABELS } from "@/types/resume";
import { downloadExport } from "@/lib/resume.api";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  resume: Resume;
  title: string;
  onTitleChange: (title: string) => void;
  template: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  fontFamily: ResumeFontFamily;
  onFontChange: (font: ResumeFontFamily) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onRetrySave: () => void;
  onOpenStarter: () => void;
  onOpenAts: () => void;
  onOpenShare: () => void;
}

const COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#0F172A",
  "#DB2777",
];

export function BuilderToolbar(props: Props) {
  const navigate = useNavigate();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  const download = async (format: "pdf" | "docx") => {
    setDownloading(format);
    try {
      const filename = `${(props.title || "resume").replace(/[^a-z0-9-_]+/gi, "_")}.${format}`;
      await downloadExport(props.resume._id, format, filename);
      toast.success(`${format.toUpperCase()} ready`);
    } catch (err) {
      toast.error(extractErrorMessage(err, `${format.toUpperCase()} export failed`));
    } finally {
      setDownloading(null);
      setDownloadOpen(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 md:px-6">
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/business/resumes")}>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">All resumes</span>
        </Button>

        <Input
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          placeholder="Untitled Resume"
          className="h-9 min-w-[150px] flex-1 bg-background sm:max-w-sm"
        />

        <SaveIndicator status={props.saveStatus} onRetry={props.onRetrySave} />

        <div className="ml-auto flex max-w-full shrink-0 flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Select
              value={props.template}
              onChange={(e) => props.onTemplateChange(e.target.value as ResumeTemplate)}
              className="h-9 w-36"
            >
              {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>

            <Select
              value={props.fontFamily}
              onChange={(e) => props.onFontChange(e.target.value as ResumeFontFamily)}
              className="h-9 w-32"
            >
              {Object.entries(FONT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>

            <ColorPicker color={props.themeColor} onChange={props.onThemeColorChange} />
          </div>

          <Button type="button" variant="outline" size="sm" onClick={props.onOpenStarter}>
            <Sparkles className="size-3.5" /> Starter
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={props.onOpenAts}>
            <ShieldCheck className="size-3.5" /> ATS
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={props.onOpenShare}>
            <Share2 className="size-3.5" /> Share
          </Button>

          <Popover open={downloadOpen} onOpenChange={setDownloadOpen}>
            <PopoverTrigger asChild>
              <Button type="button" size="sm">
                <Download className="size-3.5" /> Export
                <ChevronDown className="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => void download("pdf")}
                  disabled={downloading !== null}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  {downloading === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => void download("docx")}
                  disabled={downloading !== null}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  {downloading === "docx" ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                  Download DOCX
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile-only template/color row */}
      <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
        <Select
          value={props.template}
          onChange={(e) => props.onTemplateChange(e.target.value as ResumeTemplate)}
          className="h-9 flex-1"
        >
          {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
        <ColorPicker color={props.themeColor} onChange={props.onThemeColorChange} />
      </div>
    </div>
  );
}

function SaveIndicator({
  status,
  onRetry,
}: {
  status: Props["saveStatus"];
  onRetry: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
      >
        {status === "saving" && (
          <>
            <Loader2 className="size-3 animate-spin" />
            Saving...
          </>
        )}
        {status === "saved" && <span className="text-emerald-600">Saved</span>}
        {status === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-destructive"
          >
            <RefreshCw className="size-3" /> Failed - retry
          </button>
        )}
        {status === "idle" && <span className="opacity-0">.</span>}
      </motion.div>
    </AnimatePresence>
  );
}

function ColorPicker({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Theme color"
          className="flex h-9 items-center gap-2 rounded-md border border-input px-2.5"
        >
          <span
            className="size-4 rounded-full border border-border"
            style={{ backgroundColor: color }}
          />
          <Palette className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-3">
          <p className="text-xs font-medium">Theme color</p>
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                aria-label={`Use ${c}`}
                className={cn(
                  "size-8 rounded-md border border-border",
                  color.toLowerCase() === c.toLowerCase() && "ring-2 ring-primary"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="h-9 w-9 rounded-md"
            />
            <Input
              value={color.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toUpperCase());
              }}
              className="h-9"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
