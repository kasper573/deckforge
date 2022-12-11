import { useRouteParams } from "react-typesafe-routes";
import { isEqual } from "lodash";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useSelector } from "../../store";
import { useActions } from "../../../lib/useActions";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useOnChange } from "../../hooks/useOnChange";
import { refEquals } from "../../../lib/refEquals";
import { editorActions } from "./actions";
import { selectors } from "./selectors";

export function LocalAndRemoteStateSynchronizer() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);
  const localGame = useSelector(selectors.game);
  const { selectGame: setLocalGame } = useActions(editorActions);
  const setRemoteGame = useToastProcedure(trpc.game.update);

  useOnChange(
    remoteGame,
    () => {
      if (remoteGame) {
        setLocalGame(remoteGame);
      }
    },
    { isEqual: refEquals, handleInitial: true }
  );

  useOnChange(localGame, () => {
    if (!isEqual(localGame, remoteGame)) {
      setRemoteGame.mutate(localGame);
    }
  });

  return null;
}
