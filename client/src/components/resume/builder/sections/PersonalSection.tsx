import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Resume } from "@/types/resume";

interface Props {
  resumeId: string;
}

const FIELDS: Array<{ key: keyof Resume["content"]["personal"]; label: string; placeholder?: string; type?: string }> = [
  { key: "fullName", label: "Full name", placeholder: "Jane Doe" },
  { key: "jobTitle", label: "Headline / job title", placeholder: "Senior Product Designer" },
  { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
  { key: "phone", label: "Phone", placeholder: "+1 555 010 2030" },
  { key: "location", label: "Location", placeholder: "Remote · Berlin, DE" },
  { key: "website", label: "Website", placeholder: "yourdomain.com" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
  { key: "github", label: "GitHub", placeholder: "github.com/you" },
];

export function PersonalSection({ resumeId: _resumeId }: Props) {
  const { control } = useFormContext<Resume>();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {FIELDS.map((field) => (
        <div key={field.key} className={field.key === "fullName" || field.key === "jobTitle" ? "md:col-span-2" : ""}>
          <Label htmlFor={`personal.${field.key}`} className="mb-1.5 block">
            {field.label}
          </Label>
          <Controller
            control={control}
            name={`content.personal.${field.key}` as const}
            render={({ field: ctl }) => (
              <Input
                id={`personal.${field.key}`}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                value={ctl.value ?? ""}
                onChange={(e) => ctl.onChange(e.target.value)}
                onBlur={ctl.onBlur}
                ref={ctl.ref}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}
