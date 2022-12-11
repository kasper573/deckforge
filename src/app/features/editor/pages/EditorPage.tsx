import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { LocalAndRemoteStateSynchronizer } from "../StateSynchronizer";
import { InspectorPanel } from "../components/InspectorPanel";
import { CodePanel } from "../components/CodePanel";
import { ProjectPanel } from "../components/ProjectPanel";
import { EditorToolbar } from "../components/EditorToolbar";

export default function EditorPage() {
  return (
    <>
      <EditorToolbar />
      <EditorPanels onContextMenu={disableContextMenu}>
        <CodePanel />
        <ProjectPanel />
        <InspectorPanel />
      </EditorPanels>
      <LocalAndRemoteStateSynchronizer />
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
