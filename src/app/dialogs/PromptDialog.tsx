import TextField from "@mui/material/TextField";
import type { ReactNode } from "react";
import type { ZodString } from "zod";
import { z } from "zod";
import { useMemo } from "react";
import type { ModalProps } from "../../lib/useModal";
import { FormDialog } from "./FormDialog";

export type PromptDialogProps<T extends ZodString = ZodString> = ModalProps<
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
  ...rest
}: PromptDialogProps<T>) {
  const valueSchema = useMemo(
    () => z.object({ value: fieldSchema ?? z.string() }),
    [fieldSchema]
  );
  return (
    <FormDialog
      input={{
        cancelLabel,
        submitLabel,
        title,
        schema: valueSchema,
        defaultValues: { value: defaultValue },
        layout: (form) => (
          <TextField
            label={label}
            helperText={helperText}
            margin="dense"
            fullWidth
            autoFocus
            variant="standard"
            {...form.register("value")}
          />
        ),
      }}
      resolve={(result) => {
        if (result.type === "submit") {
          resolve(result.value.value);
        } else {
          resolve(undefined);
        }
      }}
      {...rest}
    />
  );
}
