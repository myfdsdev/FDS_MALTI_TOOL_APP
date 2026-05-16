import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { AIImproveButton } from "@/components/resume/ai/AIImproveButton";
import type { Resume } from "@/types/resume";

interface Props {
  resumeId: string;
}

const MAX = 800;

export function SummarySection({ resumeId }: Props) {
  const { control } = useFormContext<Resume>();
  return (
    <Controller
      control={control}
      name="content.personal.summary"
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              2–4 sentences. Lead with what you do best.
            </p>
            <AIImproveButton
              resumeId={resumeId}
              field="personal.summary"
              currentValue={field.value ?? ""}
              onAccept={(value) => field.onChange(value)}
            />
          </div>
          <Textarea
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value.slice(0, MAX))}
            placeholder="Senior engineer focused on platform reliability. I lead small teams shipping fast, ergonomic developer tooling…"
            rows={5}
          />
          <p className="text-right text-[10px] text-muted-foreground">
            {(field.value ?? "").length}/{MAX}
          </p>
        </div>
      )}
    />
  );
}
