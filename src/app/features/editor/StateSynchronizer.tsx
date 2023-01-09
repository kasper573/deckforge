import { useRouteParams } from "react-typesafe-routes";
import { useEffect } from "react";
import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useActions } from "../../../lib/useActions";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import { useSelector } from "./store";
import { selectors } from "./selectors";
import { editorActions } from "./actions";
import { getDefaultGameDefinition } from "./getDefaultGameDefinition";
import { editorGameType } from "./types";

export function StateSynchronizer({
  onLocalInstanceInitialized,
}: {
  onLocalInstanceInitialized?: () => void;
}) {
  const { selectGame: setLocalGame } = useActions(editorActions);
  const { gameId } = useRouteParams(router.editor);
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
      onLocalInstanceInitialized?.();
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
    // Store in local storage
    if (localGame) {
      localGameStorage.save(localGame);
    }

    // Upload to server
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

const localGameStorage = createZodStorage(
  editorGameType.optional(),
  "local-game-definition"
);
