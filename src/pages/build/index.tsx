import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { Delete, Edit, Play } from "../../components/icons";
import Link from "../../components/Link";
import { Header } from "../../components/Header";

export default function GameEditorListPage() {
  return (
    <>
      <Header>GameEditorListPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <GameListItem />
          <GameListItem />
          <GameListItem />
        </List>
      </Paper>
      <Button variant="contained">Create new game</Button>
    </>
  );
}

export function GameListItem() {
  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton component={Link} href="/play/foo" aria-label="play">
            <Play />
          </IconButton>
          <IconButton component={Link} href="/build/gameId" aria-label="edit">
            <Edit />
          </IconButton>
          <IconButton edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary="Game name" />
    </ListItem>
  );
}
