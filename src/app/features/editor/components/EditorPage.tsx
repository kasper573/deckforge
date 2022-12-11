import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSynchronizeGame } from "../hooks";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { ProjectPanel } from "./ProjectPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./InspectorPanel";

export default function EditorPage() {
  const isSynchronized = useSynchronizeGame();
  if (!isSynchronized) {
    return null;
  }
  return (
    <>
      <EditorHeader />
      <EditorPanels onContextMenu={disableContextMenu}>
        <CodePanel />
        <ProjectPanel />
        <InspectorPanel />
      </EditorPanels>
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
