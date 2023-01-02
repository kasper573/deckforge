import type { ZodType } from "zod";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { useModal } from "../../lib/useModal";
import type { ZodDialogProps } from "../dialogs/ZodDialog";
import { ZodDialog } from "../dialogs/ZodDialog";
import { Edit } from "../components/icons";
import type { PropertyValueType } from "../../api/services/game/types";
import type { ZodControlProps } from "./ZodControl";

export type ZodPickerProps<T extends ZodType> = ZodControlProps<T> &
  Omit<ZodDialogProps<T>["input"], keyof ZodControlProps<T>>;

export function ZodPicker<T extends ZodType>({
  onChange,
  ...dialogProps
}: ZodPickerProps<T>) {
  const showDialog = useModal(ZodDialog);
  async function tryUpdateValue() {
    const result = await showDialog(dialogProps);
    if ("data" in result) {
      onChange(result.data);
    }
  }
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <div>{describePropertyValueType(dialogProps.value)}</div>
      <div>
        <IconButton edge="end" size="small" onClick={tryUpdateValue}>
          <Edit />
        </IconButton>
      </div>
    </Stack>
  );
}

function describePropertyValueType<T extends PropertyValueType>(
  type: T
): string {
  if (typeof type === "string") {
    return type;
  }
  return "Object";
}
