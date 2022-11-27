import { useRouteParams } from "react-typesafe-routes";
import { Page } from "../layout/Page";
import { router } from "../router";

export default function GamePlayPage() {
  const { gameId } = useRouteParams(router.play);
  return <Page>GamePlayPage: {gameId}</Page>;
}
