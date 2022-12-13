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

export default function EditorPage() {
  const panelLayout = useSelector(selectors.panelLayout);
  const { setPanelLayout } = useActions(editorActions);
  return (
    <Root onContextMenu={disableContextMenu}>
      <PanelContainer
        value={panelLayout}
        onChange={setPanelLayout}
        renderTile={(panelId, path) => {
          const { component: Panel, title } = panelsDefinition[panelId];
          return <Panel path={path} title={title} />;
        }}
      />
      <StateSynchronizer />
    </Root>
  );
}

// Disable any unhandled context menus
function disableContextMenu<T>(e: MouseEvent<T>) {
  e.preventDefault();
}

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
