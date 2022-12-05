import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import Stack from "@mui/material/Stack";
import type { Card } from "@prisma/client";
import Typography from "@mui/material/Typography";
import { LinkIconButton } from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";
import { TextField } from "../controls/TextField";
import { trpc } from "../trpc";
import { useModal } from "../../lib/useModal";
import { PromptDialog } from "../dialogs/PromptDialog";
import { ConfirmDialog } from "../dialogs/ConfirmDialog";

export default function DeckEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { data: deck } = trpc.deck.read.useQuery(deckId);
  const renameDeck = trpc.deck.rename.useMutation();

  const { data: cards } = trpc.card.list.useQuery({
    filter: { deckId },
    offset: 0,
    limit: 10,
  });

  const createCard = trpc.card.create.useMutation();
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateDeck() {
    const name = await prompt({
      title: "Create new card",
      fieldProps: { label: "Card name" },
    });
    if (!name) {
      return;
    }
    createCard.mutate({ gameId, deckId, name });
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
              onValueChange={(name) => renameDeck.mutate({ id: deckId, name })}
            />
          </span>
        </Stack>
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Cards">
          {cards?.entities.map((card) => (
            <CardListItem key={card.id} {...card} />
          ))}
          {cards?.total === 0 && (
            <Typography align="center">
              {"This deck doesn't contain any cards yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button variant="contained" onClick={enterNameAndCreateDeck}>
        Create new card
      </Button>
    </Page>
  );
}

export function CardListItem({ gameId, deckId, id: cardId, name }: Card) {
  const confirm = useModal(ConfirmDialog);
  const deleteCard = trpc.card.delete.useMutation();

  async function confirmDelete() {
    const shouldDelete = await confirm({
      title: "Delete card",
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteCard.mutate(cardId);
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
