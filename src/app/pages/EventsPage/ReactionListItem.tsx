import type { Reaction } from "@prisma/client";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/system";
import ListItem from "@mui/material/ListItem";
import { useToastMutation } from "../../hooks/useToastMutation";
import { trpc } from "../../trpc";
import { useModal } from "../../../lib/useModal";
import { DeleteDialog } from "../../dialogs/DeleteDialog";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { MenuOn } from "../../components/MenuOn";
import { More } from "../../components/icons";

export function ReactionListItem({ reactionId, name }: Reaction) {
  const deleteReaction = useToastMutation(trpc.event.deleteReaction);
  const updateReaction = useToastMutation(trpc.event.updateReaction);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);

  return (
    <ListItemWithShowActionsOnHover
      secondaryAction={
        <MenuOn
          MenuListProps={{ "aria-label": `Options for ${name}` }}
          trigger={({ toggle }) => (
            <IconButton
              aria-label={`Show options for ${name}`}
              onClick={toggle}
            >
              <More />
            </IconButton>
          )}
        >
          <MenuItem>Edit</MenuItem>
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
              confirmDelete({ subject: "action", name }).then(
                (confirmed) => confirmed && deleteReaction.mutate(reactionId)
              )
            }
          >
            Delete
          </MenuItem>
        </MenuOn>
      }
    >
      <ListItemText primary={name} />
    </ListItemWithShowActionsOnHover>
  );
}

const ListItemWithShowActionsOnHover = styled(ListItem)`
  &:not(:hover) .MuiButtonBase-root {
    display: none;
  }
`;
