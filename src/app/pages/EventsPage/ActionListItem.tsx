import type { Action } from "@prisma/client";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { trpc } from "../../trpc";
import { useToastMutation } from "../../hooks/useToastMutation";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { MenuOn } from "../../components/MenuOn";
import { More } from "../../components/icons";
import { ReactionListItem } from "./ReactionListItem";
import { useEventsPageState } from "./eventsPageState";

export function ActionListItem({ actionId, name }: Action) {
  const { activeObjectId, setActiveObjectId } = useEventsPageState();
  const { data: reactions } = trpc.event.reactions.useQuery(actionId);
  const deleteAction = useToastMutation(trpc.event.deleteAction);
  const updateAction = useToastMutation(trpc.event.updateAction);
  const createReaction = useToastMutation(trpc.event.createReaction);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);
  return (
    <>
      <ListItem
        button
        onClick={() => setActiveObjectId({ type: "action", actionId })}
        selected={
          activeObjectId?.type === "action" &&
          activeObjectId.actionId === actionId
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
                }).then(
                  (name) => name && updateAction.mutate({ actionId, name })
                )
              }
            >
              Rename
            </MenuItem>
            <MenuItem
              onClick={() =>
                confirmDelete({ subject: "action", name }).then(
                  (confirmed) => confirmed && deleteAction.mutate(actionId)
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
                  (name) =>
                    name && createReaction.mutate({ actionId, name, code: "" })
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
      {reactions?.length !== 0 && (
        <Box sx={{ ml: 2 }}>
          <List dense sx={{ pt: 0 }}>
            {reactions?.map((reaction) => (
              <ReactionListItem key={reaction.reactionId} {...reaction} />
            ))}
          </List>
        </Box>
      )}
    </>
  );
}
