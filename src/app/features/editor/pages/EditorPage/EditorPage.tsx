import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { Provider as ReduxProvider } from "react-redux/es/exports";
import { useRouteParams } from "react-typesafe-routes";
import { StateSynchronizer } from "../../utils/StateSynchronizer";
import { editorStore } from "../../store";
import { router } from "../../../../router";
import { useAuth } from "../../../auth/store";
import { useOfflineGameService } from "../../utils/OfflineGameService";
import { EditorIntro } from "./EditorIntro";
import { EditorPanelLayout } from "./EditorPanelLayout";

export default function EditorPageWithRedux() {
  const { isAuthenticated } = useAuth();
  const { gameId } = useRouteParams(router.editor().edit);
  useOfflineGameService({ enabled: !isAuthenticated });
  return (
    <ReduxProvider store={editorStore}>
      <Root onContextMenu={disableUnhandledContextMenu}>
        <StateSynchronizer gameId={gameId} />
        <EditorPanelLayout />
        <EditorIntro />
      </Root>
    </ReduxProvider>
  );
}

function disableUnhandledContextMenu<T>(e: MouseEvent<T>) {
  e.preventDefault();
}

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
