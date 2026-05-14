import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { useTools } from "@/hooks/useTools";
import { getCategoryIcon } from "@/lib/tool-icons";
import { ToolCard } from "@/components/tools/ToolCard";
import type { ToolCategory } from "@/types/api";

const VALID: ToolCategory[] = ["marketing", "business", "design", "video", "local", "quick"];

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { categories, byCategory, isLoading } = useTools();

  const isValid = !!category && (VALID as string[]).includes(category);
  const cat = category as ToolCategory;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Unknown category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <code className="font-mono">{category}</code> isn&rsquo;t a valid category.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const Icon = getCategoryIcon(cat);
  const label = categories?.[cat]?.label ?? cat;
  const tools = byCategory(cat);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Category</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tools.length} tool{tools.length === 1 ? "" : "s"} in this category.
          </p>
        </div>
      </header>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
        }}
        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </motion.div>
    </div>
  );
}
