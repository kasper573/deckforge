import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { ObjectInspector } from "react-inspector";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import type { ModalProps } from "../../lib/useModal";

export type InspectorDialogProps = ModalProps<
  void,
  {
    title?: ReactNode;
    value: unknown;
    closeLabel?: ReactNode;
  }
>;

export function InspectorDialog({
  open,
  input: { title = "Inspector", value, closeLabel = "Close" },
  resolve,
}: InspectorDialogProps) {
  const close = () => resolve();

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <ObjectInspector data={value} theme="chromeDark" expandLevel={1} />
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained" autoFocus onClick={close}>
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
