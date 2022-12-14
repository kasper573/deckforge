import { useModal } from "../../../lib/useModal";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { useActions } from "../../../lib/useActions";
import { ConfirmDialog } from "../../dialogs/ConfirmDialog";
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
    });
    if (newName) {
      renameObject(objectId, newName);
    }
  };
}

export function usePromptCreate() {
  const prompt = useModal(PromptDialog);
  return async function promptCreate(
    typeName: string,
    create: (name: string) => void
  ) {
    const newName = await prompt({
      title: `Create ${typeName}`,
      label: "Name",
    });
    if (newName) {
      create(newName);
    }
  };
}
