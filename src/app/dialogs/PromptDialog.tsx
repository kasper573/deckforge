import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import type { ZodString } from "zod";
import { z } from "zod";
import { useMemo } from "react";
import type { ModalProps } from "../../lib/useModal";
import { useForm } from "../hooks/useForm";

export type PromptDialogProps<T extends ZodString> = ModalProps<
  string | undefined,
  {
    title: ReactNode;
    schema?: T;
    label?: string;
    defaultValue?: z.infer<T>;
    submitLabel?: ReactNode;
    cancelLabel?: ReactNode;
    helperText?: ReactNode;
  }
>;

export function PromptDialog<T extends ZodString>({
  open,
  input: {
    title,
    schema: fieldSchema,
    label,
    defaultValue,
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    helperText,
  },
  resolve,
}: PromptDialogProps<T>) {
  const formSchema = useMemo(
    () => z.object({ value: fieldSchema ?? z.string() }),
    [fieldSchema]
  );

  const form = useForm(formSchema, { defaultValues: { value: defaultValue } });

  function cancel() {
    form.reset();
    resolve(undefined);
  }

  function onSubmit({ value }: { value: z.infer<T> }) {
    resolve(value);
    form.reset();
  }

  return (
    <Dialog disableRestoreFocus fullWidth open={open} onClose={cancel}>
      <form name="prompt" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            label={label}
            helperText={helperText}
            margin="dense"
            fullWidth
            autoFocus
            variant="standard"
            {...form.register("value")}
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
