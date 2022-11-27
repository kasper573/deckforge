import { useRouteParams } from "react-typesafe-routes";
import { EntityEditor } from "../components/EntityEditor";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { router } from "../router";

export default function EntityEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { entityId } = useRouteParams(
    router.build().game({ gameId }).entity().edit
  );
  return (
    <Page>
      <Header>
        Game: {gameId}, Entity: {entityId}
      </Header>
      <EntityEditor />
    </Page>
  );
}
