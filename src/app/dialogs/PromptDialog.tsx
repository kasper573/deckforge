import type { ReactNode } from "react";
import type { ZodString, ZodEffects } from "zod";
import { z } from "zod";
import { useMemo } from "react";
import type { ModalProps } from "../../lib/useModal";
import { DialogTextField } from "../controls/DialogTextField";
import { FormDialog } from "./FormDialog";

type StringLike = ZodString | ZodEffects<ZodString>;

export type PromptDialogProps<T extends StringLike = ZodString> = ModalProps<
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

export function PromptDialog<T extends StringLike>({
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
    () => z.object({ value: (fieldSchema ?? z.string()) as ZodString }),
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
          <DialogTextField
            label={label}
            helperText={helperText}
            autoFocus
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
