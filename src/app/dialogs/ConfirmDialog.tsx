import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import type { DialogProps } from "../../lib/useDialog";

export type ConfirmDialogProps = DialogProps<
  boolean,
  {
    title: ReactNode;
    content: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
  }
>;

export function ConfirmDialog({
  open,
  input: { title, content, confirmLabel = "Yes", cancelLabel = "Cancel" },
  resolve,
}: ConfirmDialogProps) {
  const cancel = () => resolve(false);
  const confirm = () => resolve(true);

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={cancel}>{cancelLabel}</Button>
        <Button type="submit" variant="contained" autoFocus onClick={confirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
