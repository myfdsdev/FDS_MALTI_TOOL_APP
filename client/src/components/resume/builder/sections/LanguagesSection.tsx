import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Resume } from "@/types/resume";

export function LanguagesSection() {
  const { control } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.languages",
    keyName: "_rhfId",
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add languages you speak professionally.</p>
      )}
      {fields.map((field, index) => (
        <div key={field._rhfId} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field name={`content.languages.${index}.name`} label="Language" placeholder="English" />
          <Field name={`content.languages.${index}.level`} label="Level" placeholder="Native, C2, B1…" />
          <div className="flex items-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: nanoid(8), name: "", level: "" })
        }
      >
        <Plus className="size-3.5" /> Add language
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
