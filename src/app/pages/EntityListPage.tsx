import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";

export default function EntityListPage() {
  const { gameId } = useRouteParams(router.build().game);
  return (
    <Page>
      <Header>Game: {gameId}. Entity List</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <EntityListItem gameId={gameId} entityId="Player" />
          <EntityListItem gameId={gameId} entityId="Card" />
        </List>
      </Paper>
    </Page>
  );
}

export function EntityListItem({
  gameId,
  entityId,
}: {
  gameId: string;
  entityId: string;
}) {
  return (
    <LinkListItem
      to={router.build().game({ gameId }).entity().edit({ entityId })}
    >
      <ListItemText primary={entityId} />
    </LinkListItem>
  );
}
