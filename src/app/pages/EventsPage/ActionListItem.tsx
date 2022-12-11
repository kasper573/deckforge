import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { More } from "../../components/icons";
import { useSelector } from "../../store";
import { useActions } from "../../../lib/useActions";
import type { Action } from "../../../api/services/game/types";
import { MenuFor } from "../../components/MenuFor";
import { editorActions } from "../../features/editor/actions";
import { selectors } from "../../features/editor/selectors";
import { ReactionListItem } from "./ReactionListItem";

export function ActionListItem({ actionId, name }: Action) {
  const reactions = useSelector(selectors.reactionsFor(actionId));
  const selectedObject = useSelector(selectors.selectedObject);
  const { deleteAction, updateAction, createReaction, selectObject } =
    useActions(editorActions);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);
  return (
    <>
      <ListItem
        button
        onClick={() => selectObject({ type: "action", actionId })}
        selected={
          selectedObject?.type === "action" &&
          selectedObject.actionId === actionId
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
                }).then((name) => name && updateAction({ actionId, name }))
              }
            >
              Rename
            </MenuItem>
            <MenuItem
              onClick={() =>
                confirmDelete({ subject: "action", name }).then(
                  (confirmed) => confirmed && deleteAction(actionId)
                )
              }
            >
              Delete
            </MenuItem>
            <MenuItem
              onClick={() =>
                prompt({
                  title: `Add reaction to ${name}`,
                  fieldProps: { label: "Reaction name" },
                }).then(
                  (name) => name && createReaction({ actionId, name, code: "" })
                )
              }
            >
              Add reaction
            </MenuItem>
          </MenuFor>
        }
      >
        <ListItemText primary={name} />
      </ListItem>
      {reactions.length !== 0 && (
        <Box sx={{ ml: 2 }}>
          <List dense sx={{ pt: 0 }}>
            {reactions.map((reaction) => (
              <ReactionListItem key={reaction.reactionId} {...reaction} />
            ))}
          </List>
        </Box>
      )}
    </>
  );
}
