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
import type { EditorSyncState } from "../types";

export function StateSynchronizer({ gameId }: { gameId: GameId }) {
  const localGame = useSelector(selectors.game);
  const [debouncedLocalGame] = useDebounce(localGame, 1500);
  const { mutate: upload, isLoading: isUploading } = useToastProcedure(
    trpc.game.update
  );
  const { selectGame: setLocalGame, setSyncState } = useActions(editorActions);
  const { data: remoteGame, isLoading: isDownloading } =
    trpc.game.read.useQuery({
      type: "gameId",
      gameId,
    });

  const derivedSyncState = deriveSyncState({
    hasPendingChange: localGame !== debouncedLocalGame,
    isDownloading,
    isUploading,
  });

  useEffect(() => {
    setSyncState(derivedSyncState);
  }, [setSyncState, derivedSyncState]);

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

function deriveSyncState({
  hasPendingChange,
  isDownloading,
  isUploading,
}: {
  hasPendingChange: boolean;
  isDownloading: boolean;
  isUploading: boolean;
}): EditorSyncState {
  if (hasPendingChange) {
    return "dirty";
  }
  if (isDownloading || isUploading) {
    return "syncing";
  }
  return "synced";
}
