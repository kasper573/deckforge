import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import Typography from "@mui/material/Typography";
import { LinkIconButton } from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";
import { trpc } from "../trpc";
import { useModal } from "../../lib/useModal";
import { PromptDialog } from "../dialogs/PromptDialog";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { useSelector } from "../store";
import { editorActions, selectors } from "../features/editor/editorState";
import { useActions } from "../../lib/useActions";
import type { Deck } from "../../api/services/game/types";

export default function DeckListPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: game } = trpc.game.read.useQuery(gameId);
  const decks = useSelector(selectors.decks);
  const { createDeck } = useActions(editorActions);
  const prompt = useModal(PromptDialog);

  return (
    <Page>
      <Header>Game: {game?.name}. Deck List</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Decks">
          {decks.map((deck) => (
            <DeckListItem key={deck.deckId} {...deck} />
          ))}
          {decks.length === 0 && (
            <Typography align="center">
              {"This game doesn't contain any decks yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button
        variant="contained"
        onClick={() =>
          prompt({
            title: "Create new deck",
            fieldProps: { label: "Deck name" },
          }).then((name) => {
            name && createDeck({ name });
          })
        }
      >
        Create new deck
      </Button>
    </Page>
  );
}

export function DeckListItem({ deckId, name }: Deck) {
  const { gameId } = useSelector(selectors.game);
  const confirm = useModal(ConfirmDialog);
  const { deleteDeck } = useActions(editorActions);

  async function confirmDelete() {
    const shouldDelete = await confirm({
      title: "Delete game",
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteDeck(deckId);
    }
  }

  return (
    <ListItem
      aria-label={name}
      secondaryAction={
        <>
          <LinkIconButton
            to={router.build().game({ gameId }).deck().edit({ deckId })}
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
