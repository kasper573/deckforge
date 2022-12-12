import { useRouteParams } from "react-typesafe-routes";
import { useEffect, useRef } from "react";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useSelector } from "../../store";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useActions } from "../../../lib/useActions";
import { selectors } from "./selectors";
import { editorActions } from "./actions";

export function StateSynchronizer() {
  const { downloadGame } = useActions(editorActions);
  const { gameId } = useRouteParams(router.build().game);
  const localGame = useSelector(selectors.game);
  const { mutate: uploadGame } = useToastProcedure(trpc.game.update);
  const latestUploader = useRef(uploadGame);
  latestUploader.current = uploadGame;

  useEffect(() => {
    downloadGame(gameId);
  }, [downloadGame, gameId]);

  useEffect(() => {
    if (localGame) {
      latestUploader.current(localGame);
    }
  }, [localGame]);

  return null;
}
