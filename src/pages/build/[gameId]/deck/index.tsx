import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Link from "../../../../components/Link";
import { Delete, Edit } from "../../../../components/icons";
import { Header } from "../../../../components/Header";

export default function DeckListPage() {
  return (
    <>
      <Header>DeckListPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <DeckListItem />
          <DeckListItem />
          <DeckListItem />
        </List>
      </Paper>
      <Button variant="contained">Create new deck</Button>
    </>
  );
}

export function DeckListItem() {
  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton
            component={Link}
            href="/build/gameId/deck/deckId"
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
      <ListItemText primary="Deck name" />
    </ListItem>
  );
}
