import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AIImproveButton } from "@/components/resume/ai/AIImproveButton";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/resume";

interface Props {
  resumeId: string;
}

export function ProjectsSection({ resumeId }: Props) {
  const { control, watch, setValue } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.projects",
    keyName: "_rhfId",
  });
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add a side project or notable work.</p>
      )}
      {fields.map((field, index) => {
        const isOpen = openIdx === index;
        const name = watch(`content.projects.${index}.name`) || "Untitled project";
        const bullets = watch(`content.projects.${index}.bullets`) ?? [];
        const tech = watch(`content.projects.${index}.tech`) ?? [];
        return (
          <div key={field._rhfId} className="rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <p className="truncate text-sm font-medium">{name}</p>
              <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field name={`content.projects.${index}.name`} label="Name" />
                  <Field name={`content.projects.${index}.link`} label="Link" placeholder="github.com/you/proj" />
                </div>
                <Controller
                  control={control}
                  name={`content.projects.${index}.description`}
                  render={({ field: ctl }) => (
                    <div>
                      <Label className="mb-1 block">Description</Label>
                      <Textarea value={ctl.value ?? ""} onChange={(e) => ctl.onChange(e.target.value)} rows={2} />
                    </div>
                  )}
                />
                <div>
                  <Label className="mb-1.5 block">Bullets</Label>
                  <div className="space-y-2">
                    {bullets.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                        <Textarea
                          value={bullet}
                          rows={2}
                          onChange={(e) => {
                            const next = [...bullets];
                            next[i] = e.target.value;
                            setValue(`content.projects.${index}.bullets`, next, { shouldDirty: true });
                          }}
                          className="flex-1"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <AIImproveButton
                            resumeId={resumeId}
                            field={`projects.${index}.bullets.${i}`}
                            currentValue={bullet}
                            onAccept={(value) => {
                              const next = [...bullets];
                              next[i] = value;
                              setValue(`content.projects.${index}.bullets`, next, { shouldDirty: true });
                            }}
                          />
                          <button
                            type="button"
                            aria-label="Remove bullet"
                            onClick={() => {
                              const next = [...bullets];
                              next.splice(i, 1);
                              setValue(`content.projects.${index}.bullets`, next, { shouldDirty: true });
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
                      onClick={() =>
                        setValue(`content.projects.${index}.bullets`, [...bullets, ""], { shouldDirty: true })
                      }
                    >
                      <Plus className="size-3.5" /> Add bullet
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Tech stack</Label>
                  <Input
                    value={tech.join(", ")}
                    onChange={(e) => {
                      const list = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      setValue(`content.projects.${index}.tech`, list, { shouldDirty: true });
                    }}
                    placeholder="React, Node, Postgres"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { remove(index); setOpenIdx(-1); }}>
                    <Trash2 className="size-3.5" /> Remove project
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
            name: "",
            link: "",
            description: "",
            bullets: [],
            tech: [],
          });
          setOpenIdx(fields.length);
        }}
      >
        <Plus className="size-3.5" /> Add project
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
          <Input value={(ctl.value as string | null) ?? ""} onChange={(e) => ctl.onChange(e.target.value)} placeholder={placeholder} />
        )}
      />
    </div>
  );
}
