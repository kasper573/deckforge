import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { More } from "../../components/icons";
import type { Reaction } from "../../../api/services/game/types";
import { useActions } from "../../../lib/useActions";
import { useSelector } from "../../store";
import { MenuFor } from "../../components/MenuFor";
import { editorActions } from "../../features/editor/actions";
import { selectors } from "../../features/editor/selectors";

export function ReactionListItem({ reactionId, name }: Reaction) {
  const { deleteReaction, updateReaction, selectObject } =
    useActions(editorActions);
  const selectedObject = useSelector(selectors.selectedObject);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);

  return (
    <ListItem
      button
      onClick={() => selectObject({ type: "reaction", reactionId })}
      selected={
        selectedObject?.type === "reaction" &&
        selectedObject.reactionId === reactionId
      }
      secondaryAction={
        <MenuFor
          MenuListProps={{ "aria-label": `Options for ${name}` }}
          trigger={({ open }) => (
            <IconButton
              size="small"
              aria-label={`Show options for ${name}`}
              onClick={open}
            >
              <More />
            </IconButton>
          )}
        >
          <MenuItem
            onClick={() =>
              prompt({
                title: `Rename ${name}`,
                fieldProps: { label: "New name" },
              }).then((name) => name && updateReaction({ reactionId, name }))
            }
          >
            Rename
          </MenuItem>
          <MenuItem
            onClick={() =>
              confirmDelete({ subject: "action", name }).then(
                (confirmed) => confirmed && deleteReaction(reactionId)
              )
            }
          >
            Delete
          </MenuItem>
        </MenuFor>
      }
    >
      <ListItemText primary={name} />
    </ListItem>
  );
}
