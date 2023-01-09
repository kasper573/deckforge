import type { ZodString } from "zod";
import { useHistory } from "react-router";
import { useModal } from "../../../lib/useModal";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { useActions } from "../../../lib/useActions";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
import {
  eventType,
  cardType,
  deckType,
  propertyType,
  middlewareType,
} from "../../../api/services/game/types";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { trpc } from "../../trpc";
import { router } from "../../router";
import { useAuth } from "../auth/store";
import { editorActions } from "./actions";
import type { EditorObjectId } from "./types";
import { getDefaultGameDefinition } from "./getDefaultGameDefinition";

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
  return async function promptRename({
    objectId,
    name,
  }: {
    objectId: EditorObjectId;
    name: string;
  }) {
    const newName = await prompt({
      title: `Rename ${objectId.type}`,
      label: "New name",
      defaultValue: name,
      schema: objectNameSchemas[objectId.type],
    });
    if (newName) {
      renameObject(objectId, newName);
    }
  };
}

export function usePromptCreate() {
  const prompt = useModal(PromptDialog);
  return async function promptCreate(
    type: EditorObjectId["type"],
    create: (name: string) => void
  ) {
    const newName = await prompt({
      title: `Create ${type}`,
      label: "Name",
      schema: objectNameSchemas[type],
    });
    if (newName) {
      create(newName);
    }
  };
}

export function useCreateGame() {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);

  if (createGame.isSuccess || createGame.isLoading) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor(name: string) {
    if (!isAuthenticated) {
      // Go to the editor without a persisted game
      history.push(router.editor({ gameId: undefined }).$);
      return;
    }

    try {
      // Create the game for the current user and open the editor for that game
      const { gameId } = await createGame.mutateAsync({
        name,
        definition: await getDefaultGameDefinition(),
      });
      history.push(router.editor({ gameId }).$);
    } catch {}
  }

  return createGameAndGotoEditor;
}

const objectNameSchemas: Record<EditorObjectId["type"], ZodString> = {
  property: propertyType.shape.name,
  middleware: middlewareType.shape.name,
  event: eventType.shape.name,
  card: cardType.shape.name,
  deck: deckType.shape.name,
};
