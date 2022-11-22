import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import { Delete, Edit, Play } from "../../components/icons";
import Link from "../../components/Link";

export default function GameEditorListPage() {
  return (
    <>
      GameEditorListPage
      <GameList />
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

export function GameList() {
  return (
    <Paper>
      <List dense>
        <GameListItem />
        <GameListItem />
        <GameListItem />
      </List>
    </Paper>
  );
}
