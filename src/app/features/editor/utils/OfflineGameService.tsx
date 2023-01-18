import { z } from "zod";
import { useEffect, useMemo } from "react";
import { setupWorker } from "msw";
import { createZodStorage } from "../../../../lib/zod-extensions/zodStorage";
import { gameIdType, gameType } from "../../../../api/services/game/types";

export function createOfflineGameService() {
  return setupWorker();
}

export function useOfflineGameService({ enabled }: { enabled: boolean }) {
  const offlineGameService = useMemo(() => createOfflineGameService(), []);
  useEffect(() => {
    if (enabled) {
      offlineGameService.start();
    }
    return () => offlineGameService.stop();
  }, [enabled, offlineGameService]);
}

const localGameStore = createZodStorage(
  z.map(gameIdType, gameType).optional(),
  "local-game-definition"
);
