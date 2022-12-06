import type { ModalProps } from "../../lib/useModal";
import { ConfirmDialog } from "./ConfirmDialog";

export type DeleteDialogProps = ModalProps<
  boolean,
  { subject: string; name: string }
>;

export function DeleteDialog({
  input: { subject, name },
  ...rest
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      input={{
        title: `Delete ${subject}`,
        content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
      }}
      {...rest}
    />
  );
}
