import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { isEqual } from "lodash";
import { trpc } from "../../../trpc";
import { useToastProcedure } from "../../../hooks/useToastProcedure";
import { useActions } from "../../../../lib/useActions";
import type { GameId } from "../../../../api/services/game/types";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { editorActions } from "../actions";

export function StateSynchronizer({ gameId }: { gameId: GameId }) {
  const { selectGame: setLocalGame } = useActions(editorActions);
  const [localGame] = useDebounce(useSelector(selectors.game), 1500);

  const { mutate: uploadGame } = useToastProcedure(trpc.game.update);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);

  useEffect(() => {
    if (remoteGame?.gameId === gameId) {
      setLocalGame(remoteGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, remoteGame?.gameId, setLocalGame]);

  useEffect(() => {
    if (
      localGame &&
      localGame?.gameId === remoteGame?.gameId &&
      !isEqual(localGame, remoteGame)
    ) {
      uploadGame(localGame);
    }
  }, [localGame, remoteGame, setLocalGame, uploadGame]);

  return null;
}
