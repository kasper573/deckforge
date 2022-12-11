import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { selectors } from "../selectors";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { Edit } from "../../../components/icons";
import { useModal } from "../../../../lib/useModal";
import { PromptDialog } from "../../../dialogs/PromptDialog";

export function EditorToolbar() {
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
    <Toolbar>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography>{game.name}</Typography>
        <div>
          <Tooltip title="Rename">
            <IconButton onClick={promptRename}>
              <Edit />
            </IconButton>
          </Tooltip>
        </div>
      </Stack>
    </Toolbar>
  );
}
