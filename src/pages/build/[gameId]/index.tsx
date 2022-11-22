import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { Header } from "../../../components/Header";
import Link from "../../../components/Link";

export default function GameEditPage() {
  return (
    <>
      <Header>GameEditPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <ListItemButton component={Link} href="/build/gameId/deck">
            <ListItemText primary="Decks" />
          </ListItemButton>
          <ListItemButton component={Link} href="/build/gameId/entity">
            <ListItemText primary="Entities" />
          </ListItemButton>
          <ListItemButton component={Link} href="/build/gameId/events">
            <ListItemText primary="Events" />
          </ListItemButton>
        </List>
      </Paper>
    </>
  );
}
