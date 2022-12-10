import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { MenuOn } from "../../components/MenuOn";
import { More } from "../../components/icons";
import { useSelector } from "../../store";
import { editorActions, selectors } from "../../features/editor/editorState";
import { useActions } from "../../../lib/useActions";
import type { Action } from "../../../api/services/game/types";
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
          <MenuOn
            MenuListProps={{ "aria-label": `Options for ${name}` }}
            trigger={({ toggle }) => (
              <IconButton
                size="small"
                aria-label={`Show options for ${name}`}
                onClick={toggle}
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
          </MenuOn>
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
