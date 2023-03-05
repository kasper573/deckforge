import type { ComponentProps } from "react";
import { v4 } from "uuid";
import { useModal } from "../../../../lib/useModal";
import { InspectorDialog } from "../../../dialogs/InspectorDialog";
import { BaseLogValue } from "./BaseLogValue";

// Use a shared ID so each inspectable value doesn't allocate a new dialog
const sharedInspectorDialogId = v4();

export function InspectableLogValue(
  props: ComponentProps<typeof BaseLogValue>
) {
  const inspect = useModal(InspectorDialog, {}, sharedInspectorDialogId);
  return (
    <BaseLogValue
      {...props}
      sx={{ cursor: "pointer" }}
      onClick={() => inspect({ value: props.value })}
    />
  );
}
