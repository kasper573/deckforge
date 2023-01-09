import { useRouteParams } from "react-typesafe-routes";
import { useEffect } from "react";
import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useActions } from "../../../lib/useActions";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { useSelector } from "./store";
import { selectors } from "./selectors";
import { editorActions } from "./actions";
import { getDefaultGameDefinition } from "./getDefaultGameDefinition";

export function StateSynchronizer() {
  const { selectGame: setLocalGame } = useActions(editorActions);
  const { gameId } = useRouteParams(router.editor);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data: remoteGame } = trpc.game.read.useQuery(gameId!, {
    enabled: !!gameId,
  });
  const [localGame] = useDebounce(useSelector(selectors.game), 1500);
  const { mutate: uploadGame } = useToastProcedure(trpc.game.update);
  const defaultDefinition = useAsyncMemo(getDefaultGameDefinition);

  useEffect(() => {
    if (remoteGame) {
      // Whenever the remote game changes, update the local game
      setLocalGame(remoteGame);
    } else if (defaultDefinition) {
      // When no remote game is available we will auto create a local game instance
      setLocalGame({
        definition: defaultDefinition,
        name: "New game",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, defaultDefinition, remoteGame?.gameId]);

  // Whenever the local game changes, upload it to the server
  useEffect(() => {
    if (
      localGame?.gameId && // Missing gameId means it's a local instance that cannot be uploaded
      localGame.gameId === remoteGame?.gameId &&
      !isEqual(localGame, remoteGame)
    ) {
      uploadGame({ ...localGame, gameId: localGame.gameId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localGame]);

  return null;
}
