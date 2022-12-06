import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { Game } from "@prisma/client";
import { PromptDialog } from "../dialogs/PromptDialog";
import { useModal } from "../../lib/useModal";
import { router } from "../router";
import { LinkIconButton } from "../components/Link";
import { Page } from "../layout/Page";
import { Header } from "../components/Header";
import { Delete, Edit, Play } from "../components/icons";
import { trpc } from "../trpc";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { useToastProcedure } from "../hooks/useToastProcedure";

export default function BuildPage() {
  const gameList = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const createGame = useToastProcedure(trpc.game.create);
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateGame() {
    const name = await prompt({
      title: "Create new game",
      fieldProps: { label: "Game name" },
    });
    if (!name) {
      return;
    }
    createGame.mutate({ name });
  }

  return (
    <Page>
      <Header>BuildPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Games">
          {gameList.data?.entities.map((game) => (
            <GameListItem key={game.gameId} {...game} />
          ))}
          {gameList.data?.total === 0 && (
            <Typography align="center">
              {"You haven't created any games yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button variant="contained" onClick={enterNameAndCreateGame}>
        Create new game
      </Button>
    </Page>
  );
}

function GameListItem({ gameId, name }: Game) {
  const confirm = useModal(ConfirmDialog);
  const deleteGame = useToastProcedure(trpc.game.delete);

  async function confirmDelete() {
    const shouldDelete = await confirm({
      title: "Delete game",
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteGame.mutate(gameId);
    }
  }

  return (
    <ListItem
      aria-label={name}
      secondaryAction={
        <>
          <LinkIconButton to={router.play().game({ gameId })} aria-label="play">
            <Play />
          </LinkIconButton>
          <LinkIconButton
            to={router.build().game({ gameId })}
            aria-label="edit"
          >
            <Edit />
          </LinkIconButton>
          <IconButton edge="end" aria-label="delete" onClick={confirmDelete}>
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary={name} />
    </ListItem>
  );
}
