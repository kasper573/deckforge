import { useRouteParams } from "react-typesafe-routes";
import { Page } from "../layout/Page";
import { router } from "../router";

export default function GamePlayPage() {
  const { gameId } = useRouteParams(router.play().game);
  return <Page>GamePlayPage: {gameId}</Page>;
}
