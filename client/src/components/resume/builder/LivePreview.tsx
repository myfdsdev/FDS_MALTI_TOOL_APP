import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplateComponent } from "@/components/resume/templates";
import type {
  ResumeContent,
  ResumeFontFamily,
  ResumeTemplate,
} from "@/types/resume";

interface LivePreviewProps {
  content: ResumeContent;
  template: ResumeTemplate;
  themeColor: string;
  fontFamily: ResumeFontFamily;
}

const PAGE_WIDTH = 794; // A4 width @ 96dpi
const PAGE_HEIGHT = 1123; // A4 height @ 96dpi

type Zoom = "fit" | 0.5 | 0.75 | 1;

export function LivePreview({ content, template, themeColor, fontFamily }: LivePreviewProps) {
  const [zoom, setZoom] = useState<Zoom>("fit");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const obs = new ResizeObserver(() => {
      setContainerWidth(wrap.clientWidth);
    });
    obs.observe(wrap);
    setContainerWidth(wrap.clientWidth);
    return () => obs.disconnect();
  }, []);

  const TemplateComponent = useMemo(() => getTemplateComponent(template), [template]);

  const fitScale = containerWidth > 0
    ? Math.max(0.35, Math.min(1, (containerWidth - 48) / PAGE_WIDTH))
    : 0.75;
  const scale = zoom === "fit" ? fitScale : zoom;
  const scaledHeight = PAGE_HEIGHT * scale;

  return (
    <div ref={wrapRef} className="relative flex h-full w-full flex-col">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-border bg-background px-4 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Live preview</p>
          <p className="text-[11px] text-muted-foreground">A4 document</p>
        </div>
        <div className="flex items-center gap-1">
          <ZoomButton onClick={() => setZoom(0.5)} active={zoom === 0.5} label="50%">
            50%
          </ZoomButton>
          <ZoomButton onClick={() => setZoom(0.75)} active={zoom === 0.75} label="75%">
            75%
          </ZoomButton>
          <ZoomButton onClick={() => setZoom(1)} active={zoom === 1} label="100%">
            100%
          </ZoomButton>
          <ZoomButton onClick={() => setZoom("fit")} active={zoom === "fit"} label="Fit width">
            <Maximize2 className="size-3.5" />
          </ZoomButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/50 p-4 sm:p-6">
        <div
          className="mx-auto origin-top overflow-hidden bg-white shadow-2xl ring-1 ring-black/5"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: scaledHeight - PAGE_HEIGHT,
          }}
        >
          <TemplateComponent
            content={content}
            themeColor={themeColor}
            fontFamily={fontFamily}
          />
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-md px-2 py-1 text-xs transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}
