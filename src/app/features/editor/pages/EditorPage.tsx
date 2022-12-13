import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { StateSynchronizer } from "../StateSynchronizer";
import { defaultPanelLayout, PanelContainer, panels } from "../panels";

export default function EditorPage() {
  return (
    <Root onContextMenu={disableContextMenu}>
      <PanelContainer
        initialValue={defaultPanelLayout}
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
