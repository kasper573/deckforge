import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";
import { useSelector } from "../store";
import type { EntityId } from "../../api/services/game/types";
import { selectors } from "../features/editor/editorState";

export default function EntityListPage() {
  const { gameId } = useSelector(selectors.game);
  return (
    <Page>
      <Header>Game: {gameId}. Entity List</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <EntityListItem entityId="card" name="Card" />
          <EntityListItem entityId="player" name="Player" />
        </List>
      </Paper>
    </Page>
  );
}

export function EntityListItem({
  entityId,
  name,
}: {
  entityId: EntityId;
  name: string;
}) {
  const { gameId } = useSelector(selectors.game);
  return (
    <LinkListItem
      to={router.build().game({ gameId }).entity().edit({ entityId })}
    >
      <ListItemText primary={name} />
    </LinkListItem>
  );
}
