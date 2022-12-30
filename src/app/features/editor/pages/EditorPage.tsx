import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { Provider as ReduxProvider } from "react-redux/es/exports";
import { StateSynchronizer } from "../StateSynchronizer";

import { panelsDefinition } from "../panels/definition";
import { PanelContainer } from "../components/PanelContainer";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { editorStore } from "../store";

export default function EditorPage() {
  return (
    <ReduxProvider store={editorStore}>
      <Root onContextMenu={disableUnhandledContextMenu}>
        <EditorPanelContainer />
        <StateSynchronizer />
      </Root>
    </ReduxProvider>
  );
}

function EditorPanelContainer() {
  const panelLayout = useSelector(selectors.panelLayout);
  const { setPanelLayout } = useActions(editorActions);
  return (
    <PanelContainer
      value={panelLayout ?? null}
      onChange={setPanelLayout}
      zeroStateView={
        <PanelEmptyState>
          All panels are closed. <br />
          You can select panels from the menu in the app bar.
        </PanelEmptyState>
      }
      renderTile={(panelId, path) => {
        const { component: Panel, title } = panelsDefinition[panelId];
        return <Panel path={path} title={title} />;
      }}
    />
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
