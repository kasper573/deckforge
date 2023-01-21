import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import { trpc } from "../../../trpc";
import { useToastProcedure } from "../../../hooks/useToastProcedure";
import { useActions } from "../../../../lib/useActions";
import type { GameId } from "../../../../api/services/game/types";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { editorActions } from "../actions";
import { useReaction } from "../../../../lib/useReaction";

export function StateSynchronizer({ gameId }: { gameId: GameId }) {
  const localGame = useSelector(selectors.game);
  const [debouncedLocalGame] = useDebounce(localGame, 1500);
  const { selectGame: setLocalGame } = useActions(editorActions);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);
  const { mutate: upload } = useToastProcedure(trpc.game.update);

  // Update local game when remote game changes
  useReaction(() => {
    if (remoteGame?.gameId === gameId) {
      setLocalGame(remoteGame);
    }
  }, [gameId, remoteGame]);

  // Update remote game when local game changes
  useReaction(() => {
    if (debouncedLocalGame && !isEqual(debouncedLocalGame, remoteGame)) {
      upload(debouncedLocalGame);
    }
  }, [debouncedLocalGame]);

  // Unset local game when unmounting
  useEffect(
    () => () => {
      setLocalGame(undefined);
    },
    [setLocalGame]
  );

  return null;
}
