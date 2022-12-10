import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LinkIconButton } from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";
import { TextField } from "../controls/TextField";
import { useModal } from "../../lib/useModal";
import { PromptDialog } from "../dialogs/PromptDialog";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";
import { useSelector } from "../store";
import { editorActions, selectors } from "../features/editor/editorState";
import { useActions } from "../../lib/useActions";
import type { Card } from "../../api/services/game/types";

export default function DeckEditPage() {
  const { gameId } = useSelector(selectors.game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const deck = useSelector(selectors.deck(deckId));
  const cards = useSelector(selectors.cardsFor(deckId));
  const { updateDeck, createCard } = useActions(editorActions);
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateCard() {
    const name = await prompt({
      title: "Create new card",
      fieldProps: { label: "Card name" },
    });
    if (!name) {
      return;
    }
    createCard({ deckId, name, code: "", propertyDefaults: {} });
  }

  return (
    <Page>
      <Header>
        <Stack direction="row" spacing={2}>
          <span>Game: {gameId}.</span>
          <span>
            <TextField
              debounce
              label="Deck name"
              value={deck?.name ?? ""}
              onValueChange={(name) => updateDeck({ deckId, name })}
            />
          </span>
        </Stack>
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Cards">
          {cards.map((card) => (
            <CardListItem key={card.cardId} {...card} />
          ))}
          {cards.length === 0 && (
            <Typography align="center">
              {"This deck doesn't contain any cards yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button variant="contained" onClick={enterNameAndCreateCard}>
        Create new card
      </Button>
    </Page>
  );
}

export function CardListItem({ deckId, cardId, name }: Card) {
  const { gameId } = useSelector(selectors.game);
  const confirm = useModal(ConfirmDialog);
  const { deleteCard } = useActions(editorActions);

  async function confirmDelete() {
    const shouldDelete = await confirm({
      title: "Delete card",
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteCard(cardId);
    }
  }

  return (
    <ListItem
      aria-label={name}
      secondaryAction={
        <>
          <LinkIconButton
            to={router
              .build()
              .game({ gameId })
              .deck()
              .edit({ deckId })
              .card({ cardId })}
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
