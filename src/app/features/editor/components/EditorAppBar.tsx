import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { selectors } from "../selectors";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { Edit, ExitToApp } from "../../../components/icons";
import { useModal } from "../../../../lib/useModal";
import { PromptDialog } from "../../../dialogs/PromptDialog";
import { Header } from "../../layout/Header";
import { LinkIconButton } from "../../../components/Link";
import { router } from "../../../router";
import { AppBar } from "../../layout/AppBar";

export default function EditorAppBar() {
  const prompt = useModal(PromptDialog);
  const game = useSelector(selectors.game);
  const { renameGame } = useActions(editorActions);

  async function promptRename() {
    const newName = await prompt({
      title: "Rename game",
      fieldProps: { label: "New name", defaultValue: game.name },
    });
    if (newName) {
      renameGame(newName);
    }
  }

  return (
    <AppBar container={false}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Leave editor">
          <div>
            <LinkIconButton edge="start" to={router.build()}>
              <ExitToApp />
            </LinkIconButton>
          </div>
        </Tooltip>
        <Header sx={{ m: 0 }}>{game.name}</Header>
        <Tooltip title="Rename">
          <div>
            <IconButton onClick={promptRename}>
              <Edit />
            </IconButton>
          </div>
        </Tooltip>
      </Stack>
    </AppBar>
  );
}
