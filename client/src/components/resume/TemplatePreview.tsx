import { useEffect, useRef, useState } from "react";
import { getTemplateComponent } from "./templates";
import { starterPlaceholderContent } from "./templates/shared/utils";
import type { ResumeTemplate } from "@/types/resume";

interface Props {
  template: ResumeTemplate;
  themeColor?: string;
  className?: string;
}

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

/**
 * Scaled-down preview of the actual template with placeholder content.
 * Used in the template gallery.
 */
export function TemplatePreview({ template, themeColor = "#4F46E5", className }: Props) {
  const Component = getTemplateComponent(template);
  const content = starterPlaceholderContent();

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const obs = new ResizeObserver(() => {
      setScale(wrap.clientWidth / PAGE_WIDTH);
    });
    obs.observe(wrap);
    setScale(wrap.clientWidth / PAGE_WIDTH);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={className}>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-md border border-border bg-white shadow-sm"
        style={{ paddingTop: `${(PAGE_HEIGHT / PAGE_WIDTH) * 100}%` }}
      >
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <Component content={content} themeColor={themeColor} fontFamily="inter" isExportMode />
        </div>
      </div>
    </div>
  );
}
