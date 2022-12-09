import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/system";
import { useRouteParams } from "react-typesafe-routes";
import Typography from "@mui/material/Typography";
import type { Action, Reaction } from "@prisma/client";
import { Header } from "../components/Header";
import { CodeEditor } from "../components/CodeEditor";
import { SideMenu } from "../components/SideMenu";
import { Add, Delete, Edit, More } from "../components/icons";
import { Page } from "../layout/Page";
import { router } from "../router";
import { trpc } from "../trpc";
import { useToastMutation } from "../hooks/useToastMutation";
import { useModal } from "../../lib/useModal";
import { DeleteDialog } from "../dialogs/DeleteDialog";
import { PromptDialog } from "../dialogs/PromptDialog";

export default function EventsPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: actions } = trpc.event.actions.useQuery(gameId);

  const createAction = useToastMutation(trpc.event.createAction);
  const prompt = useModal(PromptDialog);

  return (
    <Page>
      <Header>Game: {gameId}</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <Button
            variant="contained"
            onClick={() =>
              prompt({
                title: `Add action`,
                fieldProps: { label: "Action name" },
              }).then(
                (name) =>
                  name && createAction.mutate({ gameId, name, code: "" })
              )
            }
          >
            Create action
          </Button>
          <List dense>
            {actions?.map((action) => (
              <ActionListItem key={action.actionId} {...action} />
            ))}
            {actions?.length === 0 && (
              <Typography>This game contains no actions yet!</Typography>
            )}
          </List>
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </Page>
  );
}

function ActionListItem({ actionId, name }: Action) {
  const { data: reactions } = trpc.event.reactions.useQuery(actionId);
  const deleteAction = useToastMutation(trpc.event.deleteAction);
  const createReaction = useToastMutation(trpc.event.createReaction);
  const confirmDelete = useModal(DeleteDialog);
  const prompt = useModal(PromptDialog);
  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton aria-label="edit">
              <Edit />
            </IconButton>
            <IconButton
              aria-label="delete"
              onClick={() =>
                confirmDelete({ subject: "action", name }).then(
                  (confirmed) => confirmed && deleteAction.mutate(actionId)
                )
              }
            >
              <Delete />
            </IconButton>
            <Tooltip title="Add reaction">
              <IconButton
                edge="end"
                aria-label="Add reaction"
                onClick={() =>
                  prompt({
                    title: `Add reaction to ${name}`,
                    fieldProps: { label: "Reaction name" },
                  }).then(
                    (name) =>
                      name &&
                      createReaction.mutate({ actionId, name, code: "" })
                  )
                }
              >
                <Add />
              </IconButton>
            </Tooltip>
          </>
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

function ReactionListItem({ name }: Reaction) {
  return (
    <ListItemWithShowActionsOnHover
      secondaryAction={
        <IconButton>
          <More />
        </IconButton>
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
