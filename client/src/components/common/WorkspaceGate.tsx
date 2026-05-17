import { type ReactNode } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { DisabledNotice } from "@/components/common/DisabledNotice";
import { WORKSPACE_LABELS, type WorkspaceKey } from "@/types/featureFlags";

interface Props {
  workspace: WorkspaceKey;
  children: ReactNode;
}

/**
 * Wrap a page in this to auto-show DisabledNotice when an admin has globally
 * disabled the workspace it belongs to.
 */
export function WorkspaceGate({ workspace, children }: Props) {
  const { isWorkspaceDisabled, isLoading } = useFeatureFlags();
  if (isLoading) return <>{children}</>;
  if (isWorkspaceDisabled(workspace)) {
    return (
      <DisabledNotice
        title={`${WORKSPACE_LABELS[workspace]} is disabled`}
        message="The site admin has temporarily turned this workspace off for everyone."
      />
    );
  }
  return <>{children}</>;
}
