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
import { useToastMutation } from "../hooks/useToastMutation";

export default function DeckEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { data: deck } = trpc.deck.read.useQuery(deckId);
  const renameDeck = useToastMutation(trpc.deck.rename);

  const { data: cards } = trpc.card.list.useQuery({
    filter: { deckId },
    offset: 0,
    limit: 10,
  });

  const createCard = useToastMutation(trpc.card.create);
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateCard() {
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
              onValueChange={(name) => renameDeck.mutate({ deckId, name })}
            />
          </span>
        </Stack>
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Cards">
          {cards?.entities.map((card) => (
            <CardListItem key={card.cardId} {...card} />
          ))}
          {cards?.total === 0 && (
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

export function CardListItem({ gameId, deckId, cardId, name }: Card) {
  const confirm = useModal(ConfirmDialog);
  const deleteCard = useToastMutation(trpc.card.delete);

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
