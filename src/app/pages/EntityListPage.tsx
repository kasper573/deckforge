import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";
import { trpc } from "../trpc";
import type { Entity } from "../../api/services/entity/types";

export default function EntityListPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: entities } = trpc.entity.listEntities.useQuery({ gameId });
  return (
    <Page>
      <Header>Game: {gameId}. Entity List</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          {entities?.map((entity) => (
            <EntityListItem key={entity.entityId} {...entity} />
          ))}
        </List>
      </Paper>
    </Page>
  );
}

export function EntityListItem({ gameId, entityId, name }: Entity) {
  return (
    <LinkListItem
      to={router.build().game({ gameId }).entity().edit({ entityId })}
    >
      <ListItemText primary={name} />
    </LinkListItem>
  );
}
