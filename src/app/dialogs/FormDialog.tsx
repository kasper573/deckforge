import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import type { ZodType } from "zod";
import type { z } from "zod";
import type { DefaultValues } from "react-hook-form";
import type { ModalProps } from "../../lib/useModal";
import type { UseFormResult } from "../hooks/useForm";
import { useForm } from "../hooks/useForm";

export interface FormDialogProps<T extends ZodType>
  extends ModalProps<
    { type: "submit"; value: z.infer<T> } | { type: "cancel" }
  > {
  title: ReactNode;
  schema: T;
  defaultValues?: DefaultValues<z.infer<T>>;
  submitLabel?: ReactNode;
  cancelLabel?: ReactNode;
  layout: (form: UseFormResult<T>) => ReactNode;
}

export function FormDialog<T extends ZodType>({
  open,
  title,
  schema,
  defaultValues,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  layout: createFormFieldRegistrations,
  resolve,
}: FormDialogProps<T>) {
  const form = useForm<T>(schema, { defaultValues });

  function cancel() {
    form.reset();
    resolve({ type: "cancel" });
  }

  function onSubmit(value: z.infer<T>) {
    resolve({ type: "submit", value });
    form.reset();
  }

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <form name="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{createFormFieldRegistrations(form)}</DialogContent>
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
