import { isEqual, omit } from "lodash";
import { useDebounce } from "use-debounce";
import { useEffect } from "react";
import { CANCEL_INVALIDATE, trpc } from "../../../trpc";
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
  const [debouncedLocalGame] = useDebounce(localGame, 1500);
  const { mutate: upload, isLoading: isUploading } = useToastProcedure(
    trpc.game.update,
    {
      onSuccess(game) {
        handleRemoteGameChange(keepDefinition(localGame, game));
        return CANCEL_INVALIDATE;
      },
    }
  );
  const {
    selectGame: setLocalGame,
    setSyncState,
    clearLogs,
  } = useActions(editorActions);
  const { data: remoteGame, isFetching: isDownloading } =
    trpc.game.read.useQuery(
      { type: "gameId", gameId },
      { onSuccess: handleRemoteGameChange }
    );

  function handleRemoteGameChange(game: Game) {
    if (game.gameId === gameId && isSignificantlyDifferent(game, localGame)) {
      setLocalGame(game);
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
    if (
      debouncedLocalGame &&
      isSignificantlyDifferent(debouncedLocalGame, remoteGame)
    ) {
      upload(debouncedLocalGame);
    }
  }, [debouncedLocalGame]);

  // Unset local game when unmounting
  useEffect(
    () => () => {
      setLocalGame(undefined);
      clearLogs();
    },
    [setLocalGame, clearLogs]
  );

  return null;
}

function isSignificantlyDifferent(a?: Game, b?: Game) {
  return !isEqual(significantGameProps(a), significantGameProps(b));
}

function significantGameProps(game?: Game) {
  return game ? omit(game, "updatedAt") : undefined;
}

function keepDefinition(keep: Game | undefined, rest: Game) {
  return { ...rest, definition: keep?.definition ?? rest.definition };
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
