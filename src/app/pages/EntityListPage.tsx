import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Link from "../components/Link";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";

export default function EntityListPage() {
  return (
    <Page>
      <Header>EntityListPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <EntityListItem name="Player" />
          <EntityListItem name="Card" />
        </List>
      </Paper>
    </Page>
  );
}

export function EntityListItem({ name }: { name: string }) {
  return (
    <ListItemButton
      component={Link}
      to={{
        route: "/build/[gameId]/entity/[entityId]",
        params: { gameId: "gameId", entityId: "entityId" },
      }}
    >
      <ListItemText primary={name} />
    </ListItemButton>
  );
}
