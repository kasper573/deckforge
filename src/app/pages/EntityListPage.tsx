import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";

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
    <LinkListItem
      to={router
        .build()
        .game({ gameId: "gameId" })
        .entity()
        .edit({ entityId: name })}
    >
      <ListItemText primary={name} />
    </LinkListItem>
  );
}
