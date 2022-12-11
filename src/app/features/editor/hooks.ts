import { useRouteParams } from "react-typesafe-routes";
import { isEqual } from "lodash";
import { useModal } from "../../../lib/useModal";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { useActions } from "../../../lib/useActions";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useSelector } from "../../store";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useOnChange } from "../../hooks/useOnChange";
import { refEquals } from "../../../lib/refEquals";
import { selectors } from "./selectors";
import type { EditorObjectId } from "./types";
import { editorActions } from "./actions";

export function useConfirmDelete() {
  const confirm = useModal(ConfirmDialog);
  const { deleteObject } = useActions(editorActions);
  return async function confirmDelete({
    objectId,
    name,
  }: {
    objectId: EditorObjectId;
    name: string;
  }) {
    const shouldDelete = await confirm({
      title: `Delete ${objectId.type}`,
      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
    });
    if (shouldDelete) {
      deleteObject(objectId);
    }
  };
}

export function usePromptRename() {
  const prompt = useModal(PromptDialog);
  const { renameObject } = useActions(editorActions);
  return async function confirmDelete({
    objectId,
    name,
  }: {
    objectId: EditorObjectId;
    name: string;
  }) {
    const newName = await prompt({
      title: `Rename ${objectId.type}`,
      fieldProps: { label: "New name", defaultValue: name },
    });
    if (newName) {
      renameObject(objectId, newName);
    }
  };
}

export function useSynchronizeGame() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: remoteGame } = trpc.game.read.useQuery(gameId);
  const localGame = useSelector(selectors.game);
  const { selectGame: setLocalGame } = useActions(editorActions);
  const setRemoteGame = useToastProcedure(trpc.game.update);
  const isSynchronized = localGame.gameId === remoteGame?.gameId;

  useOnChange(
    remoteGame,
    () => {
      if (remoteGame) {
        setLocalGame(remoteGame);
      }
    },
    { isEqual: refEquals, handleInitial: true }
  );

  useOnChange(localGame, () => {
    if (!isEqual(localGame, remoteGame)) {
      setRemoteGame.mutate(localGame);
    }
  });

  return isSynchronized;
}
