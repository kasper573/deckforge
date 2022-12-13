import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { useMemo } from "react";
import { StateSynchronizer } from "../StateSynchronizer";
import { PanelContainer, panels } from "../panels";
import {
  loadUserDefaultPanelLayout,
  saveUserDefaultPanelLayout,
} from "../panels/store";

export default function EditorPage() {
  const initialValue = useMemo(loadUserDefaultPanelLayout, []);
  return (
    <Root onContextMenu={disableContextMenu}>
      <PanelContainer
        initialValue={initialValue}
        onChange={saveUserDefaultPanelLayout}
        renderTile={(panelId, path) => {
          const Panel = panels[panelId];
          return <Panel path={path} />;
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
