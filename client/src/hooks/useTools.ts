import { useMemo } from "react";
import { useTools as useToolsQuery } from "@/lib/queries";
import type { Tool, ToolCategory } from "@/types/api";

/**
 * Convenience wrapper over the tools list query. Exposes lookup helpers
 * so pages don't each re-implement id/category indexing.
 */
export function useTools() {
  const query = useToolsQuery();

  const helpers = useMemo(() => {
    const tools = query.data?.tools ?? [];
    const categories = query.data?.categories;
    const byId = new Map(tools.map((t) => [t.id, t]));

    const byCategory = (category: ToolCategory): Tool[] =>
      tools.filter((t) => t.category === category);

    const getTool = (id: string): Tool | undefined => byId.get(id);

    return { tools, categories, getTool, byCategory };
  }, [query.data]);

  return { ...query, ...helpers };
}
