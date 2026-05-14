import { useParams } from "react-router-dom";
import { ToolPage } from "@/components/tools/ToolPage";

export default function Tool() {
  const { toolId } = useParams<{ toolId: string }>();
  return <ToolPage toolId={toolId ?? ""} />;
}
