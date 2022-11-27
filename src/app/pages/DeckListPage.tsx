import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import { LinkIconButton } from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";

export default function DeckListPage() {
  const { gameId } = useRouteParams(router.build().game);
  return (
    <Page>
      <Header>DeckListPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <DeckListItem gameId={gameId} deckId="deck1" />
          <DeckListItem gameId={gameId} deckId="deck2" />
          <DeckListItem gameId={gameId} deckId="deck3" />
        </List>
      </Paper>
      <Button variant="contained">Create new deck</Button>
    </Page>
  );
}

export function DeckListItem({
  gameId,
  deckId,
}: {
  gameId: string;
  deckId: string;
}) {
  return (
    <ListItem
      secondaryAction={
        <>
          <LinkIconButton
            to={router.build().game({ gameId: "foo" }).deck().edit({ deckId })}
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
      <ListItemText primary={deckId} />
    </ListItem>
  );
}
