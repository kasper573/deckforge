import { useRouteParams } from "react-typesafe-routes";
import { isEqual } from "lodash";
import { router } from "../../router";
import { CANCEL_INVALIDATE, trpc } from "../../trpc";
import { useSelector } from "../../store";
import { useActions } from "../../../lib/useActions";
import { useToastMutation } from "../../hooks/useToastProcedure";
import { useOnChange } from "../../hooks/useOnChange";
import { refEquals } from "../../../lib/refEquals";
import { editorActions } from "./actions";
import { selectors } from "./selectors";

export function LocalAndRemoteStateSynchronizer() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);
  const localGame = useSelector(selectors.game);
  const { selectGame: setLocalGame } = useActions(editorActions);
  const remoteGameMutation = trpc.game.update.useMutation({
    onSuccess: () => CANCEL_INVALIDATE,
  });
  const setRemoteGame = useToastMutation(remoteGameMutation.mutateAsync);

  useOnChange(
    remoteGame,
    () => {
      if (remoteGame) {
        console.log("Remote game changed, updating local game");
        setLocalGame(remoteGame);
      }
    },
    { isEqual: refEquals, handleInitial: true }
  );

  useOnChange(localGame, () => {
    if (!isEqual(localGame, remoteGame)) {
      console.log("Local game changed, updating remote game");
      setRemoteGame(localGame);
    }
  });

  return null;
}
