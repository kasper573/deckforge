import type { ZodString } from "zod";
import { useModal } from "../../../../lib/useModal";
import { PromptDialog } from "../../../dialogs/PromptDialog";
import type { EditorObjectId, EditorState } from "../types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import {
  cardType,
  deckType,
  eventType,
  middlewareType,
  propertyType,
} from "../../../../api/services/game/types";
import { useStore } from "../store";

export function usePromptRename() {
  const store = useStore();
  const prompt = useModal(PromptDialog);
  const { renameObject } = useActions(editorActions);
  return async function promptRename({
    objectId,
    name,
  }: {
    objectId: EditorObjectId;
    name: string;
  }) {
    const invalidNames = selectInvalidNames(
      store.getState().editor.present,
      objectId
    );
    const newName = await prompt({
      title: `Rename ${objectId.type}`,
      label: "New name",
      defaultValue: name,
      schema: uniqueNameSchema(objectNameSchemas[objectId.type], invalidNames),
    });
    if (newName) {
      renameObject(objectId, newName);
    }
  };
}

export function usePromptCreate() {
  const prompt = useModal(PromptDialog);
  const store = useStore();
  return async function promptCreate(
    type: EditorObjectId["type"],
    create: (name: string) => void
  ) {
    const invalidNames = selectInvalidNames(store.getState().editor.present, {
      type,
    } as EditorObjectId);
    const newName = await prompt({
      title: `Create ${type}`,
      label: "Name",
      schema: uniqueNameSchema(objectNameSchemas[type], invalidNames),
    });
    if (newName) {
      create(newName);
    }
  };
}

function selectInvalidNames<Type extends EditorObjectId["type"]>(
  { game }: EditorState,
  skip: EditorObjectId
): string[] | undefined {
  switch (skip.type) {
    case "property":
      return game?.definition.properties
        .filter((m) => m.propertyId !== skip.propertyId)
        .map((p) => p.name);
    case "event":
      return game?.definition.events
        .filter((m) => m.eventId !== skip.eventId)
        .map((e) => e.name);
  }
}

const uniqueNameSchema = (schema: ZodString, existingNames?: string[]) =>
  schema.refine(
    (name) => !existingNames?.includes(name),
    "You must provide a unique name"
  );

const objectNameSchemas: Record<EditorObjectId["type"], ZodString> = {
  property: propertyType.shape.name,
  middleware: middlewareType.shape.name,
  event: eventType.shape.name,
  card: cardType.shape.name,
  deck: deckType.shape.name,
};
