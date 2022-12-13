import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { StateSynchronizer } from "../StateSynchronizer";

import { panelsDefinition } from "../panels/definition";
import { PanelContainer } from "../components/PanelContainer";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";

export default function EditorPage() {
  const panelLayout = useSelector(selectors.panelLayout);
  const { setPanelLayout } = useActions(editorActions);
  return (
    <Root onContextMenu={disableUnhandledContextMenu}>
      <PanelContainer
        value={panelLayout ?? null}
        onChange={setPanelLayout}
        zeroStateView={
          <PanelEmptyState>
            All panels are closed. You can select which panels to have open by
            selecting the panels menu in the app bar.
          </PanelEmptyState>
        }
        renderTile={(panelId, path) => {
          const { component: Panel, title } = panelsDefinition[panelId];
          return <Panel path={path} title={title} />;
        }}
      />
      <StateSynchronizer />
    </Root>
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
