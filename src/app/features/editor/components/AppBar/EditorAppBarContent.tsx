import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { selectors } from "../../selectors";
import { useSelector } from "../../../../store";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { ExitToApp } from "../../../../components/icons";
import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { LinkIconButton } from "../../../../components/Link";
import { router } from "../../../../router";
import { pageMaxWidth } from "../../../layout/Page";
import { PanelVisibilityMenu } from "./PanelVisibilityMenu";

export default function EditorAppBarContent() {
  const prompt = useModal(PromptDialog);
  const game = useSelector(selectors.game);
  const { renameGame } = useActions(editorActions);

  async function promptRename() {
    const newName = await prompt({
      title: "Rename game",
      fieldProps: { label: "New name", defaultValue: game?.name },
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
            <LinkIconButton edge="start" to={router.build()}>
              <ExitToApp />
            </LinkIconButton>
          </div>
        </Tooltip>
        <div>
          <PanelVisibilityMenu />
        </div>
      </Stack>
      <GameName maxWidth={pageMaxWidth}>{game?.name}</GameName>
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
