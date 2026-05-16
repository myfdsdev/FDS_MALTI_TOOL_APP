import type { ComponentType } from "react";
import type { ResumeTemplate } from "@/types/resume";
import type { TemplateProps } from "./shared/types";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { CompactTemplate } from "./CompactTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";

export const TEMPLATE_REGISTRY: Record<ResumeTemplate, ComponentType<TemplateProps>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
  executive: ExecutiveTemplate,
};

export function getTemplateComponent(template: ResumeTemplate): ComponentType<TemplateProps> {
  return TEMPLATE_REGISTRY[template] ?? ModernTemplate;
}
