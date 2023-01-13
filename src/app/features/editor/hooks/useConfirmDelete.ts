import { useModal } from "../../../../lib/useModal";
import { ConfirmDialog } from "../../../dialogs/ConfirmDialog";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import type { EditorObjectId } from "../types";

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
