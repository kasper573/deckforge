import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Provider as ReduxProvider } from "react-redux";
import Download from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
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
import { gameType } from "../../../../../api/services/game/types";
import { editorStore } from "../../store";
import { createJSONFile, saveFile } from "../../../../../lib/fileIO";
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
  const { renameGame } = useActions(editorActions);

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

  async function downloadGameDefinition() {
    if (game) {
      saveFile(createJSONFile(game.definition, game.name + ".json"));
    }
  }

  return (
    <Stack direction="row" sx={{ display: "flex" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Leave editor">
          <div>
            <LinkIconButton edge="start" to={router.build()}>
              <ExitToApp />
            </LinkIconButton>
          </div>
        </Tooltip>
        <div>
          <PanelVisibilityMenu />
        </div>
      </Stack>
      <GameName maxWidth={pageMaxWidth}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Rename game">
            <Clickable onClick={promptRename}>{game?.name}</Clickable>
          </Tooltip>
          {game && (
            <>
              <Tooltip title="Open public gameplay page">
                <Clickable>
                  <LinkIconButton
                    to={router.play().game({ gameId: game.gameId })}
                    target="_blank"
                  >
                    <Play />
                  </LinkIconButton>
                </Clickable>
              </Tooltip>
              <Tooltip title="Download game definition">
                <Clickable>
                  <IconButton onClick={downloadGameDefinition}>
                    <Download />
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
