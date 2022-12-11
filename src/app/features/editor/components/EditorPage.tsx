import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { LocalAndRemoteStateSynchronizer } from "../StateSynchronizer";
import { InspectorPanel } from "./InspectorPanel";
import { CodePanel } from "./CodePanel";
import { ProjectPanel } from "./ProjectPanel";

export default function EditorPage() {
  return (
    <>
      <EditorHeader />
      <EditorPanels onContextMenu={disableContextMenu}>
        <CodePanel />
        <ProjectPanel />
        <InspectorPanel />
      </EditorPanels>
      <LocalAndRemoteStateSynchronizer />
    </>
  );
}

function EditorHeader() {
  const game = useSelector(selectors.game);
  return <Typography sx={{ m: 2, mb: 0 }}>{game.name}</Typography>;
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
