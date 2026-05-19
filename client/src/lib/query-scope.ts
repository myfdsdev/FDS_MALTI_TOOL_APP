import type { QueryClient, QueryKey } from "@tanstack/react-query";

const PRIVATE_QUERY_ROOTS = new Set(["user", "business", "resumes", "reports", "admin", "gigs"]);

function queryRoot(queryKey: QueryKey): string | null {
  const [root] = queryKey;
  return typeof root === "string" ? root : null;
}

export function scopeKey(userId: string | null | undefined): string {
  return userId || "anonymous";
}

export function clearPrivateQueryData(queryClient: QueryClient, keepUserId?: string | null) {
  const keepScope = keepUserId ? scopeKey(keepUserId) : null;
  queryClient.removeQueries({
    predicate: (query) => {
      const root = queryRoot(query.queryKey);
      if (!root || !PRIVATE_QUERY_ROOTS.has(root)) return false;
      return !(keepScope && query.queryKey[1] === keepScope);
    },
  });
}
