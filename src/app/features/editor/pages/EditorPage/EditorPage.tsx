import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { Provider as ReduxProvider } from "react-redux/es/exports";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouteParams } from "react-typesafe-routes";
import type { MosaicBranch } from "react-mosaic-component";
import { StateSynchronizer } from "../../StateSynchronizer";
import type { PanelProps } from "../../panels/definition";
import { panelsDefinition } from "../../panels/definition";
import { PanelContainer } from "../../components/PanelContainer";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { PanelEmptyState } from "../../components/PanelEmptyState";
import { editorStore } from "../../store";
import type { PanelId } from "../../types";
import {
  distributeNodesEvenly,
  getKeyVisibilities,
} from "../../../../../lib/reactMosaicExtensions";
import { router } from "../../../../router";
import { EditorIntro } from "./EditorIntro";

export default function EditorPage() {
  const { gameId } = useRouteParams(router.editor);

  return (
    <ReduxProvider store={editorStore}>
      <Root onContextMenu={disableUnhandledContextMenu}>
        <ResponsiveEditorPanels />
        <StateSynchronizer gameId={gameId} />
        <EditorIntro isLocalInstance={!gameId} />
      </Root>
    </ReduxProvider>
  );
}

function ResponsiveEditorPanels() {
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));
  if (isSmallDevice) {
    return <PanelsWithColumnLayout />;
  }
  return <PanelsWithUserLayout />;
}

function PanelsWithColumnLayout() {
  const panelLayout = useSelector(selectors.panelLayout);

  const visibleNodes = useMemo(() => {
    const nodes = Object.keys(panelsDefinition) as PanelId[];
    const visibilities = getKeyVisibilities(panelLayout);
    return nodes.filter((key) => visibilities[key]);
  }, [panelLayout]);

  const columnLayout = useMemo(
    () => distributeNodesEvenly("column", visibleNodes),
    [visibleNodes]
  );

  return (
    <Box
      sx={{
        position: "relative",
        height: visibleNodes.length
          ? // Due to the even distribution column layout, all panels will have the same height.
            // So setting the entire panel container height relative to the number of panels
            // allows us to evenly size all panels.
            `calc(33vh * ${visibleNodes.length})`
          : "75vh",
      }}
    >
      <PanelContainer
        value={columnLayout}
        onChange={() => {}}
        zeroStateView={zeroStateView}
        renderTile={(panelId, path) => (
          <PanelById panelId={panelId} path={path} draggable={false} />
        )}
      />
    </Box>
  );
}

function PanelsWithUserLayout() {
  const panelLayout = useSelector(selectors.panelLayout);
  const { setPanelLayout } = useActions(editorActions);
  return (
    <PanelContainer
      value={panelLayout ?? null}
      onChange={setPanelLayout}
      zeroStateView={zeroStateView}
      renderTile={(panelId, path) => (
        <PanelById panelId={panelId} path={path} />
      )}
    />
  );
}

function PanelById({
  panelId,
  path,
  ...props
}: { panelId: PanelId; path: MosaicBranch[] } & Partial<PanelProps>) {
  const { component: Panel, title, tour } = panelsDefinition[panelId];
  return (
    <Panel
      path={path}
      title={<span className={tour?.className}>{title}</span>}
      {...props}
    />
  );
}

const zeroStateView = (
  <PanelEmptyState>
    All panels are closed. <br />
    You can select panels from the menu in the app bar.
  </PanelEmptyState>
);

function disableUnhandledContextMenu<T>(e: MouseEvent<T>) {
  e.preventDefault();
}

const Root = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
