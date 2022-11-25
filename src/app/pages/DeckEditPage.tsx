import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Link from "../components/Link";
import { Delete, Edit } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";

export default function DeckEditPage() {
  return (
    <Page>
      <Header>CardEditPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <CardListItem />
          <CardListItem />
          <CardListItem />
        </List>
      </Paper>
      <Button variant="contained">Create new card</Button>
    </Page>
  );
}

export function CardListItem() {
  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton
            component={Link}
            to={{
              route: "/build/[gameId]/deck/[deckId]/[cardId]",
              params: { gameId: "foo", deckId: "bar", cardId: "baz" },
            }}
            aria-label="edit"
          >
            <Edit />
          </IconButton>
          <IconButton edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary="Card name" />
    </ListItem>
  );
}
