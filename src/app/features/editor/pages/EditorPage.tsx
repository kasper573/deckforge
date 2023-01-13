import "react-mosaic-component/react-mosaic-component.css";
import type { MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import { Provider as ReduxProvider } from "react-redux/es/exports";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import { z } from "zod";
import { StateSynchronizer } from "../StateSynchronizer";
import { panelsDefinition } from "../panels/definition";
import { PanelContainer } from "../components/PanelContainer";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { editorStore } from "../store";
import type { PanelId } from "../types";
import {
  distributeNodesEvenly,
  getKeyVisibilities,
} from "../../../../lib/reactMosaicExtensions";
import { Link } from "../../../components/Link";
import { router } from "../../../router";
import { useModal } from "../../../../lib/useModal";
import { Toast } from "../../../components/Toast";
import { createZodStorage } from "../../../../lib/zod-extensions/zodStorage";
import { ConfirmDialog } from "../../../dialogs/ConfirmDialog";

const hasSeenIntroStorage = createZodStorage(
  z.boolean().optional(),
  "editor-has-seen-intro"
);

export default function EditorPage() {
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);
  const isEditingLocalInstanceRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (!hasSeenIntroStorage.load()) {
        const shouldTakeTour = await confirm({
          title: "Take tour?",
          content: "Content",
          confirmLabel: "Take tour",
          cancelLabel: "No thanks",
        });

        hasSeenIntroStorage.save(true);

        if (shouldTakeTour) {
          startTour();
        }
      }

      if (isEditingLocalInstanceRef.current) {
        showToast({
          variant: "info",
          duration: 12000,
          content: (
            <>
              You are not signed in and the game will only be saved on your
              device. <Link to={router.user().login()}>Sign in</Link> to save
              your game to the cloud and enable publishing games.
            </>
          ),
        });
      }
    })();
  }, [confirm, showToast]);

  function startTour() {}

  return (
    <ReduxProvider store={editorStore}>
      <Root onContextMenu={disableUnhandledContextMenu}>
        <ResponsiveEditorPanels />
        <StateSynchronizer
          onLocalInstanceInitialized={() => {
            isEditingLocalInstanceRef.current = true;
          }}
        />
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
        renderTile={(panelId, path) => {
          const { component: Panel, title } = panelsDefinition[panelId];
          return <Panel path={path} title={title} draggable={false} />;
        }}
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
      renderTile={(panelId, path) => {
        const { component: Panel, title } = panelsDefinition[panelId];
        return <Panel path={path} title={title} />;
      }}
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
