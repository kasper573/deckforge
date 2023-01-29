import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Provider as ReduxProvider } from "react-redux";
import { selectors } from "../../selectors";
import { editorStore, useSelector } from "../../store";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { ExitToApp, Play } from "../../../../components/icons";
import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { LinkIconButton } from "../../../../components/Link";
import { router } from "../../../../router";
import { pageMaxWidth } from "../../../layout/Page";
import { gameType } from "../../../../../api/services/game/types";
import { useOfflineGameServiceState } from "../../utils/shouldUseOfflineGameService";
import { EditorMenu } from "./EditorMenu";

export default function EditorAppBarContent() {
  // Store must be provided since app bar is outside the editor page
  return (
    <ReduxProvider store={editorStore}>
      <Content />
    </ReduxProvider>
  );
}

function Content() {
  const prompt = useModal(PromptDialog);
  const game = useSelector(selectors.game);
  const { renameGame } = useActions(editorActions);
  const isLocalDeviceData = useOfflineGameServiceState();
  const isGameSlugDirty = useSelector(selectors.syncState) !== "synced";

  async function promptRename() {
    const newName = await prompt({
      title: "Rename game",
      label: "New name",
      defaultValue: game?.name,
      schema: gameType.shape.name,
    });
    if (newName) {
      renameGame(newName);
    }
  }

  return (
    <Stack direction="row" sx={{ display: "flex" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Leave editor">
          <div>
            <LinkIconButton edge="start" to={router.editor({})}>
              <ExitToApp />
            </LinkIconButton>
          </div>
        </Tooltip>
        <div>
          <Box sx={{ ml: -1 }}>
            <EditorMenu />
          </Box>
        </div>
      </Stack>
      <GameName maxWidth={pageMaxWidth}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Rename game">
            <Clickable onClick={promptRename}>{game?.name}</Clickable>
          </Tooltip>
          {game && !isLocalDeviceData && (
            <Tooltip
              title={
                isGameSlugDirty
                  ? "Game is being published, please wait"
                  : "Open public gameplay page"
              }
            >
              <Clickable>
                <LinkIconButton
                  disabled={isGameSlugDirty}
                  aria-label="Open public gameplay page"
                  to={router.play({ slug: game.slug })}
                  sx={{ ml: 1 }}
                >
                  <Play />
                </LinkIconButton>
              </Clickable>
            </Tooltip>
          )}
        </Stack>
      </GameName>
    </Stack>
  );
}

const GameName = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  ${({ theme }) => theme.breakpoints.up("sm")} {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
  }
`;

const Clickable = styled(Box)`
  cursor: pointer;
  pointer-events: all;
`;
