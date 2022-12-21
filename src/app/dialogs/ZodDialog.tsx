import type { z, ZodType } from "zod";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import type { ZodControlProps } from "../controls/ZodControl";
import { ZodControl } from "../controls/ZodControl";
import type { ModalProps } from "../../lib/useModal";

export type ZodDialogOutput<T extends ZodType> =
  | { data: z.infer<T> }
  | { closed: true };

export type ZodDialogProps<T extends ZodType> = ModalProps<
  ZodDialogOutput<T>,
  Omit<ZodControlProps<T>, "onChange" | "title"> & {
    title?: ReactNode;
    submitLabel?: ReactNode;
    cancelLabel?: ReactNode;
  }
>;

export function ZodDialog<T extends ZodType>({
  open,
  resolve,
  input: {
    value: inputValue,
    title,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    ...controlProps
  },
}: ZodDialogProps<T>) {
  const [value, setValue] = useState(inputValue);

  function cancel() {
    resolve({ closed: true });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    resolve({ data: value });
  }

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <form name="prompt" onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <ZodControl {...controlProps} value={value} onChange={setValue} />
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
