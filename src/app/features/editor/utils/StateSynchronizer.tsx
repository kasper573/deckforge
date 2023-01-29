import { isEqual } from "lodash";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import { trpc } from "../../../trpc";
import { useActions } from "../../../../lib/useActions";
import type { Game, GameId } from "../../../../api/services/game/types";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { editorActions } from "../actions";
import { useReaction } from "../../../../lib/useReaction";
import type { EditorSyncState } from "../types";
import { useToastProcedure } from "../../../hooks/useToastProcedure";

export function StateSynchronizer({ gameId }: { gameId: GameId }) {
  const localGame = useSelector(selectors.game);
  const [debouncedLocalGame, debounceControls] = useDebounce(localGame, 1500);
  const { mutate: upload, isLoading: isUploading } = useToastProcedure(
    trpc.game.update,
    { success: handleRemoteGameChange }
  );
  const { selectGame: setLocalGame, setSyncState } = useActions(editorActions);
  const { data: remoteGame, isFetching: isDownloading } =
    trpc.game.read.useQuery(
      { type: "gameId", gameId },
      { onSuccess: handleRemoteGameChange }
    );

  function handleRemoteGameChange(remoteGame: Game) {
    if (remoteGame?.gameId === gameId && !isEqual(remoteGame, localGame)) {
      setLocalGame(remoteGame);
      setTimeout(() => debounceControls.flush(), 0);
    }
  }

  const derivedSyncState = deriveSyncState({
    hasPendingChange: localGame !== debouncedLocalGame,
    isDownloading,
    isUploading,
  });

  useEffect(() => {
    setSyncState(derivedSyncState);
  }, [setSyncState, derivedSyncState]);

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

function deriveSyncState(args: {
  hasPendingChange: boolean;
  isDownloading: boolean;
  isUploading: boolean;
}): EditorSyncState {
  if (args.hasPendingChange) {
    return "dirty";
  }
  if (args.isDownloading) {
    return "downloading";
  }
  if (args.isUploading) {
    return "uploading";
  }
  return "synced";
}
