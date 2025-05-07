import type { ModalProps } from "../../lib/useModal";
import { ConfirmDialog } from "./ConfirmDialog";

export interface DeleteDialogProps extends ModalProps<boolean> {
  subject: string;
  name: string;
}

export function DeleteDialog({ subject, name, ...rest }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      title={`Delete ${subject}`}
      content={`Are you sure you want to delete "${name}". This action cannot be reversed.`}
      {...rest}
    />
  );
}
