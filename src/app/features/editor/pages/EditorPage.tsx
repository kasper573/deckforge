import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { InspectorPanel } from "../components/InspectorPanel";
import { CodePanel } from "../components/CodePanel";
import { ProjectPanel } from "../components/ProjectPanel";
import { StateSynchronizer } from "../StateSynchronizer";

export default function EditorPage() {
  return (
    <>
      <EditorPanels onContextMenu={disableContextMenu}>
        <CodePanel />
        <ProjectPanel />
        <InspectorPanel />
      </EditorPanels>
      <StateSynchronizer />
    </>
  );
}

// Disable any unhandled context menus
function disableContextMenu(e: MouseEvent<HTMLDivElement>) {
  e.preventDefault();
}

const EditorPanels = styled("div")`
  display: grid;
  flex: 1;
  grid-gap: 16px;
  margin: 16px;
  grid-template-areas:
    "code code code inspector"
    "code code code project"
    "code code code project"
    "code code code project"
    "code code code project"
    "code code code project";
`;
