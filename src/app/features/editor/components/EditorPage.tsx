import type { MouseEvent } from "react";
import { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useRouteParams } from "react-typesafe-routes";
import { router } from "../../../router";
import { trpc } from "../../../trpc";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { ProjectPanel } from "./ProjectPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./InspectorPanel";

export default function EditorPage() {
  useSynchronizeGame();
  return (
    <EditorContainer onContextMenu={disableContextMenu}>
      <CodePanel />
      <ProjectPanel />
      <InspectorPanel />
    </EditorContainer>
  );
}

function useSynchronizeGame() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: game } = trpc.game.read.useQuery(gameId);
  const { selectGame } = useActions(editorActions);

  useEffect(() => {
    if (game) {
      selectGame(game);
    }
  }, [game, selectGame]);
}

// Disable any unhandled context menus
function disableContextMenu(e: MouseEvent<HTMLDivElement>) {
  e.preventDefault();
}

const EditorContainer = styled("div")`
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
