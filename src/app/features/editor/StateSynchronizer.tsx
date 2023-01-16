import { useEffect } from "react";
import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { trpc } from "../../trpc";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useActions } from "../../../lib/useActions";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import type { GameId } from "../../../api/services/game/types";
import { useSelector } from "./store";
import { selectors } from "./selectors";
import { editorActions } from "./actions";
import { getDefaultGameDefinition } from "./getDefaultGameDefinition";
import type { EditorGame } from "./types";
import { editorGameType } from "./types";

export function StateSynchronizer({ gameId }: { gameId?: GameId }) {
  const { selectGame: setLocalGame } = useActions(editorActions);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { data: remoteGame } = trpc.game.read.useQuery(gameId!, {
    enabled: !!gameId,
  });
  const [localGame] = useDebounce(useSelector(selectors.game), 1500);
  const { mutate: uploadGame } = useToastProcedure(trpc.game.update);
  const defaultDefinition = useAsyncMemo(getDefaultGameDefinition);

  // Load from remote or initialize new local game instance
  useEffect(() => {
    if (remoteGame) {
      // Whenever the remote game changes, update the local game
      setLocalGame(remoteGame);
    } else if (defaultDefinition) {
      // When no remote game is available we will auto create a local game instance
      setLocalGame(
        localGameStorage.load() ?? {
          definition: defaultDefinition,
          name: "New game",
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, defaultDefinition, remoteGame?.gameId]);

  useEffect(() => {
    if (isLocalOnlyGame(localGame)) {
      localGameStorage.save(localGame);
    } else if (
      gameId &&
      localGame?.gameId === gameId &&
      !isEqual(localGame, remoteGame)
    ) {
      uploadGame({ ...localGame, gameId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localGame]);

  return null;
}

const isLocalOnlyGame = (game?: EditorGame) => game && !game.gameId;

const localGameStorage = createZodStorage(
  editorGameType.optional(),
  "local-game-definition"
);
