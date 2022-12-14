import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import type { EditorObjectId } from "../types";
import { joinNodes } from "../../../../lib/joinNodes";
import { ObjectIcon } from "./ObjectIcon";

export function PanelTitle({
  name,
  objectType,
  breadcrumbs,
}: {
  name: string;
  objectType?: EditorObjectId["type"];
  breadcrumbs?: string[];
}) {
  if (objectType && breadcrumbs) {
    return (
      <>
        {name}
        <ObjectIcon type={objectType} sx={{ mr: 0.5, ml: 1 }} />
        {joinNodes(breadcrumbs, <KeyboardArrowRight />)}
      </>
    );
  }
  return <>{name}</>;
}
