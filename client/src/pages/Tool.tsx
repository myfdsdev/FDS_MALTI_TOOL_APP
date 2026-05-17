import { useParams } from "react-router-dom";
import { ToolPage } from "@/components/tools/ToolPage";
import { DisabledNotice } from "@/components/common/DisabledNotice";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

export default function Tool() {
  const { toolId } = useParams<{ toolId: string }>();
  const { isToolDisabled, isLoading } = useFeatureFlags();
  const id = toolId ?? "";

  if (!isLoading && isToolDisabled(id)) {
    return (
      <DisabledNotice
        title="This tool is disabled"
        message="The site admin has temporarily turned this generator off for everyone."
      />
    );
  }

  return <ToolPage toolId={id} />;
}
