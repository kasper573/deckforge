import type { Reaction } from "@prisma/client";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { trpc } from "../../trpc";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { MenuOn } from "../../components/MenuOn";
import { More } from "../../components/icons";
import { useEventsPageState } from "./eventsPageState";

export function ReactionListItem({ reactionId, name }: Reaction) {
  const { activeObjectId, setActiveObjectId, onObjectDeleted } =
    useEventsPageState();
  const deleteReaction = useToastProcedure(trpc.event.deleteReaction);
  const updateReaction = useToastProcedure(trpc.event.updateReaction);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);

  return (
    <ListItem
      button
      onClick={() => setActiveObjectId({ type: "reaction", reactionId })}
      selected={
        activeObjectId?.type === "reaction" &&
        activeObjectId.reactionId === reactionId
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
                (name) => name && updateReaction.mutate({ reactionId, name })
              )
            }
          >
            Rename
          </MenuItem>
          <MenuItem
            onClick={() =>
              confirmDelete({ subject: "action", name }).then((confirmed) => {
                if (confirmed) {
                  onObjectDeleted(activeObjectId);
                  deleteReaction.mutate(reactionId);
                }
              })
            }
          >
            Delete
          </MenuItem>
        </MenuOn>
      }
    >
      <ListItemText primary={name} />
    </ListItem>
  );
}
