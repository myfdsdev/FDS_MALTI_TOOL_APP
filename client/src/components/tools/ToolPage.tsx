import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useTools } from "@/hooks/useTools";
import { extractErrorMessage } from "@/lib/api";
import { useGenerate, type GenerateResult } from "@/lib/queries";
import { getToolIcon } from "@/lib/tool-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingDots } from "@/components/common/LoadingDots";
import { ToolForm } from "@/components/tools/ToolForm";
import { ToolOutput } from "@/components/tools/ToolOutput";

export function ToolPage({ toolId }: { toolId: string }) {
  const { getTool, categories, isLoading } = useTools();
  const tool = getTool(toolId);
  const generate = useGenerate(toolId);
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    setResult(null);
    generate.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-muted/50" />
          <div className="h-96 animate-pulse rounded-xl bg-muted/50" />
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Tool not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t find a tool with the id <code className="font-mono">{toolId}</code>.
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

  const Icon = getToolIcon(tool.id);
  const categoryLabel = categories?.[tool.category]?.label ?? tool.category;

  async function onGenerate(values: Record<string, string>) {
    try {
      const data = await generate.mutateAsync(values);
      setResult(data);
      toast.success("Generated");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Generation failed"));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div>
            <Link
              to={`/category/${tool.category}`}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {categoryLabel}
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{tool.name}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <ToolForm
              key={tool.id}
              tool={tool}
              onGenerate={onGenerate}
              isPending={generate.isPending}
            />
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Output</CardTitle>
            {result && !generate.isPending && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResult(null);
                  generate.reset();
                }}
              >
                <RotateCcw className="size-3.5" />
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <motion.div
              key={generate.isPending ? "loading" : result ? "result" : "empty"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {generate.isPending ? (
                tool.id === "link-saver" ? (
                  <ToolOutput toolId={tool.id} output={null} isLoading />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                    <LoadingDots className="text-primary" />
                    <p className="text-sm">
                      {tool.id === "url-shortener" ? "Creating your short link..." : "Generating your result..."}
                    </p>
                  </div>
                )
              ) : result ? (
                <ToolOutput toolId={tool.id} output={result.output} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Sparkles className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Nothing generated yet</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Fill in the inputs and hit Generate. Your result shows up here.
                  </p>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
