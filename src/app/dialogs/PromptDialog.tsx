import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import type { TextFieldProps } from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import type { FormEvent, ReactNode } from "react";
import { useRef } from "react";
import Dialog from "@mui/material/Dialog";
import type { ModalProps } from "../../lib/useModal";

export type PromptDialogProps = ModalProps<
  string | undefined,
  {
    title: ReactNode;
    fieldProps?: TextFieldProps;
    submitLabel?: ReactNode;
    cancelLabel?: ReactNode;
  }
>;

export function PromptDialog({
  open,
  input: { title, fieldProps, submitLabel = "Submit", cancelLabel = "Cancel" },
  resolve,
}: PromptDialogProps) {
  const inputRef = useRef<HTMLInputElement>();

  function clear() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function cancel() {
    clear();
    resolve(undefined);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    resolve(inputRef.current?.value);
    clear();
  }

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <form name="prompt" onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            autoFocus
            variant="standard"
            {...fieldProps}
            inputRef={inputRef}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>{cancelLabel}</Button>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
