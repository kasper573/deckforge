import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Provider as ReduxProvider } from "react-redux";
import Download from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import Upload from "@mui/icons-material/Upload";
import Button from "@mui/material/Button";
import { selectors } from "../../selectors";
import { useSelector } from "../../store";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { ExitToApp, Play } from "../../../../components/icons";
import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { LinkIconButton } from "../../../../components/Link";
import { router } from "../../../../router";
import { pageMaxWidth } from "../../../layout/Page";
import type { GameDefinition } from "../../../../../api/services/game/types";
import {
  gameDefinitionType,
  gameType,
} from "../../../../../api/services/game/types";
import { editorStore } from "../../store";
import { createJSONFile, loadFile, saveFile } from "../../../../../lib/fileIO";
import { AlertDialog } from "../../../../dialogs/AlertDialog";
import { ConfirmDialog } from "../../../../dialogs/ConfirmDialog";
import { Auth } from "../../../auth/Auth";
import { createEventBus } from "../../../../../lib/createEventBus";
import { PanelVisibilityMenu } from "./PanelVisibilityMenu";

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
  const { renameGame, overwriteGameDefinition } = useActions(editorActions);
  const alert = useModal(AlertDialog);
  const confirm = useModal(ConfirmDialog);

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

  function downloadGameDefinition() {
    if (game) {
      saveFile(createJSONFile(game.definition, game.name + ".json"));
    }
  }

  async function loadGameDefinition() {
    const file = await loadFile({ accept: "application/json" });
    if (!file) {
      return;
    }

    let newDefinition: GameDefinition;
    try {
      newDefinition = gameDefinitionType.parse(JSON.parse(await file.text()));
    } catch (e) {
      alert({ title: "Invalid game definition", content: String(e) });
      return;
    }

    const shouldOverwrite = await confirm({
      title: "Overwrite game definition?",
      content:
        "The current game definition will be lost forever. Are you sure you want to continue?",
    });

    if (shouldOverwrite) {
      overwriteGameDefinition(newDefinition);
    }
  }

  return (
    <Stack direction="row" sx={{ display: "flex" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Leave editor">
          <div>
            <Auth>
              {({ access }) => (
                <LinkIconButton
                  edge="start"
                  to={access ? router.user().games() : router.home()}
                >
                  <ExitToApp />
                </LinkIconButton>
              )}
            </Auth>
          </div>
        </Tooltip>
        <div>
          <PanelVisibilityMenu />
          <Button onClick={helpEvent.emit}>Help</Button>
        </div>
      </Stack>
      <GameName maxWidth={pageMaxWidth}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Rename game">
            <Clickable onClick={promptRename}>{game?.name}</Clickable>
          </Tooltip>
          {game && (
            <>
              {game.gameId && (
                <Tooltip title="Open public gameplay page">
                  <Clickable>
                    <LinkIconButton
                      to={router.play().game({ gameId: game.gameId })}
                      target="_blank"
                      sx={{ ml: 1 }}
                    >
                      <Play />
                    </LinkIconButton>
                  </Clickable>
                </Tooltip>
              )}
              <Tooltip title="Download game definition">
                <Clickable>
                  <IconButton onClick={downloadGameDefinition}>
                    <Download />
                  </IconButton>
                </Clickable>
              </Tooltip>
              <Tooltip title="Load game definition">
                <Clickable>
                  <IconButton onClick={loadGameDefinition}>
                    <Upload />
                  </IconButton>
                </Clickable>
              </Tooltip>
            </>
          )}
        </Stack>
      </GameName>
    </Stack>
  );
}

export const helpEvent = createEventBus();

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
