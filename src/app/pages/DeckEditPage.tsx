import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import Stack from "@mui/material/Stack";
import { LinkIconButton } from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";
import { TextField } from "../controls/TextField";
import { trpc } from "../trpc";

export default function DeckEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { data: deck } = trpc.deck.read.useQuery(deckId);
  const renameDeck = trpc.deck.rename.useMutation();
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
        <List dense>
          <CardListItem {...{ gameId, deckId, cardId: "card1" }} />
          <CardListItem {...{ gameId, deckId, cardId: "card2" }} />
          <CardListItem {...{ gameId, deckId, cardId: "card3" }} />
        </List>
      </Paper>
      <Button variant="contained">Create new card</Button>
    </Page>
  );
}

export function CardListItem({
  gameId,
  deckId,
  cardId,
}: {
  gameId: string;
  deckId: string;
  cardId: string;
}) {
  return (
    <ListItem
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
          <IconButton edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary={cardId} />
    </ListItem>
  );
}
