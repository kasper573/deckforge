import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import { Header } from "../../../components/Header";
import Link from "../../../components/Link";
import { Page } from "../../../layout/Page";

export default function GameEditPage() {
  return (
    <Page>
      <Header>GameEditPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <ListItemButton
            component={Link}
            to={{ route: "/build/[gameId]/deck", params: { gameId: "gameId" } }}
          >
            <ListItemText primary="Decks" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={{
              route: "/build/[gameId]/entity",
              params: { gameId: "gameId" },
            }}
          >
            <ListItemText primary="Entities" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={{
              route: "/build/[gameId]/events",
              params: { gameId: "gameId" },
            }}
          >
            <ListItemText primary="Events" />
          </ListItemButton>
        </List>
      </Paper>
    </Page>
  );
}
