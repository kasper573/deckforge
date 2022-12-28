import { useRouteParams } from "react-typesafe-routes";
import { useEffect } from "react";
import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useSelector } from "../../store";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useActions } from "../../../lib/useActions";
import { selectors } from "./selectors";
import { editorActions } from "./actions";

export function StateSynchronizer() {
  const { selectGame } = useActions(editorActions);
  const { gameId } = useRouteParams(router.build().game);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);
  const [localGame] = useDebounce(useSelector(selectors.game), 1500);
  const { mutate: uploadGame } = useToastProcedure(trpc.game.update);

  useEffect(() => {
    selectGame(remoteGame);
    return () => {
      selectGame(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteGame?.gameId]);

  useEffect(() => {
    if (
      localGame &&
      localGame.gameId === remoteGame?.gameId &&
      !isEqual(localGame, remoteGame)
    ) {
      uploadGame(localGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localGame]);

  return null;
}
