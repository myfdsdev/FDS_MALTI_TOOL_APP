import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/resume";

export function EducationSection() {
  const { control, watch } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.education",
    keyName: "_rhfId",
  });
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add at least one school or program.</p>
      )}
      {fields.map((field, index) => {
        const isOpen = openIdx === index;
        const inst = watch(`content.education.${index}.institution`) || "Untitled institution";
        const degree = watch(`content.education.${index}.degree`) || "";
        return (
          <div key={field._rhfId} className="rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{inst}</p>
                {degree && <p className="truncate text-xs text-muted-foreground">{degree}</p>}
              </div>
              <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field name={`content.education.${index}.institution`} label="Institution" />
                  <Field name={`content.education.${index}.location`} label="Location" />
                  <Field name={`content.education.${index}.degree`} label="Degree" placeholder="B.Sc., M.Eng." />
                  <Field name={`content.education.${index}.field`} label="Field" placeholder="Computer Science" />
                  <Field name={`content.education.${index}.startDate`} label="Start" placeholder="2016-09" />
                  <Field name={`content.education.${index}.endDate`} label="End" placeholder="2020-06" />
                  <Field name={`content.education.${index}.gpa`} label="GPA (optional)" />
                </div>
                <Controller
                  control={control}
                  name={`content.education.${index}.notes`}
                  render={({ field: ctl }) => (
                    <div>
                      <Label className="mb-1 block">Notes (optional)</Label>
                      <Textarea value={ctl.value ?? ""} onChange={(e) => ctl.onChange(e.target.value)} rows={2} />
                    </div>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => { remove(index); setOpenIdx(-1); }}>
                    <Trash2 className="size-3.5" /> Remove
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
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: null,
            gpa: "",
            notes: "",
          });
          setOpenIdx(fields.length);
        }}
      >
        <Plus className="size-3.5" /> Add education
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
