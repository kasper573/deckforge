import type { ZodType } from "zod";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { useModal } from "../../lib/useModal";
import { ZodDialog } from "../dialogs/ZodDialog";
import { Edit } from "../components/icons";
import type { PropertyValueType } from "../../api/services/game/types";
import type { ZodControlProps } from "./ZodControl";

export function ZodPicker<T extends ZodType>({
  onChange,
  ...controlProps
}: ZodControlProps<T>) {
  const showDialog = useModal(ZodDialog);
  async function tryUpdateValue() {
    const result = await showDialog(controlProps);
    if ("data" in result) {
      onChange(result.data);
    }
  }
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <div>{describePropertyValueType(controlProps.value)}</div>
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
