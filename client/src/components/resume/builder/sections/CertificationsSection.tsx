import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Resume } from "@/types/resume";

export function CertificationsSection() {
  const { control } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.certifications",
    keyName: "_rhfId",
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">List industry certifications (AWS, GCP, PMP…).</p>
      )}
      {fields.map((field, index) => (
        <div key={field._rhfId} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          <Field name={`content.certifications.${index}.name`} label="Name" placeholder="AWS Solutions Architect" />
          <Field name={`content.certifications.${index}.issuer`} label="Issuer" placeholder="Amazon Web Services" />
          <Field name={`content.certifications.${index}.date`} label="Date" placeholder="2024-04" />
          <Field name={`content.certifications.${index}.link`} label="Link" placeholder="credly.com/..." />
          <div className="flex justify-end sm:col-span-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: nanoid(8), name: "", issuer: "", date: "", link: "" })
        }
      >
        <Plus className="size-3.5" /> Add certification
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
