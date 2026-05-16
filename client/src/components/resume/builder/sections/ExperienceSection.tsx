import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIImproveButton } from "@/components/resume/ai/AIImproveButton";
import { BulletGenerator } from "@/components/resume/ai/BulletGenerator";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/resume";

interface Props {
  resumeId: string;
}

export function ExperienceSection({ resumeId }: Props) {
  const { control, watch, setValue } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.experience",
    keyName: "_rhfId",
  });
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No experience yet — add your first role.</p>
      )}

      {fields.map((field, index) => {
        const isOpen = openIdx === index;
        const role = watch(`content.experience.${index}.role`) || "Untitled role";
        const company = watch(`content.experience.${index}.company`) || "";
        const bullets = watch(`content.experience.${index}.bullets`) ?? [];

        return (
          <div key={field._rhfId} className="rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="flex min-w-0 items-center gap-3">
                <GripVertical className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{role}</p>
                  {company && <p className="truncate text-xs text-muted-foreground">{company}</p>}
                </div>
              </div>
              <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Role"
                    name={`content.experience.${index}.role` as const}
                    placeholder="Senior Software Engineer"
                  />
                  <Field
                    label="Company"
                    name={`content.experience.${index}.company` as const}
                    placeholder="Acme Corp"
                  />
                  <Field
                    label="Location"
                    name={`content.experience.${index}.location` as const}
                    placeholder="Remote"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Start"
                      name={`content.experience.${index}.startDate` as const}
                      placeholder="2022-01"
                    />
                    <Field
                      label="End"
                      name={`content.experience.${index}.endDate` as const}
                      placeholder="2024-06"
                    />
                  </div>
                </div>

                <Controller
                  control={control}
                  name={`content.experience.${index}.current`}
                  render={({ field: ctl }) => (
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(ctl.value)}
                        onChange={(e) => {
                          ctl.onChange(e.target.checked);
                          if (e.target.checked) {
                            setValue(`content.experience.${index}.endDate`, null);
                          }
                        }}
                      />
                      I currently work here
                    </label>
                  )}
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Bullets</Label>
                    <BulletGenerator
                      resumeId={resumeId}
                      role={role}
                      company={company}
                      existingBullets={bullets}
                      onAdd={(newBullets) => {
                        const merged = [...bullets, ...newBullets];
                        setValue(`content.experience.${index}.bullets`, merged, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                  <BulletsEditor
                    resumeId={resumeId}
                    index={index}
                    bullets={bullets}
                    onChange={(next) =>
                      setValue(`content.experience.${index}.bullets`, next, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      remove(index);
                      setOpenIdx(-1);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Remove role
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append({
            id: nanoid(8),
            role: "",
            company: "",
            location: "",
            startDate: "",
            endDate: null,
            current: false,
            bullets: [],
          });
          setOpenIdx(fields.length);
        }}
      >
        <Plus className="size-3.5" />
        Add experience
      </Button>
    </div>
  );
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  const { control } = useFormContext<Resume>();
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <Controller
        control={control}
        name={name as never}
        render={({ field: ctl }) => (
          <Input
            value={(ctl.value as string | null) ?? ""}
            onChange={(e) => ctl.onChange(e.target.value)}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
}

function BulletsEditor({
  resumeId,
  index,
  bullets,
  onChange,
}: {
  resumeId: string;
  index: number;
  bullets: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {bullets.map((bullet, i) => (
        <div key={i} className="group flex items-start gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
          <Textarea
            value={bullet}
            rows={2}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Led a major initiative that delivered measurable impact (numbers, %, $)."
            className="flex-1"
          />
          <div className="flex flex-col items-center gap-1">
            <AIImproveButton
              resumeId={resumeId}
              field={`experience.${index}.bullets.${i}`}
              currentValue={bullet}
              onAccept={(value) => {
                const next = [...bullets];
                next[i] = value;
                onChange(next);
              }}
            />
            <button
              type="button"
              aria-label="Remove bullet"
              onClick={() => {
                const next = [...bullets];
                next.splice(i, 1);
                onChange(next);
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange([...bullets, ""])}
      >
        <Plus className="size-3.5" />
        Add bullet
      </Button>
    </div>
  );
}
