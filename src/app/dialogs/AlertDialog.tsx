import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import type { ModalProps } from "../../lib/useModal";

export interface AlertDialogProps extends ModalProps {
  title: ReactNode;
  content: ReactNode;
  closeLabel?: ReactNode;
  cancelLabel?: ReactNode;
}

export function AlertDialog({
  open,
  title,
  content,
  closeLabel = "Close",
  resolve,
}: AlertDialogProps) {
  const close = () => resolve();

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button variant="contained" autoFocus onClick={close}>
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
