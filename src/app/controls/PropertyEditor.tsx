import Box from "@mui/material/Box";
import type { Property } from "../../api/services/game/types";
import { PropertyValueEditor } from "../features/editor/panels/InspectorPanel/PropertyValueEditor";
import type { PropertyTypePickerProps } from "./PropertyTypePicker";
import { PropertyTypePicker } from "./PropertyTypePicker";

export interface PropertyEditorProps
  extends Omit<PropertyTypePickerProps, "value" | "onChange"> {
  value: Property;
  onChange: (value: Property) => void;
}

export function PropertyEditor({
  value,
  onChange,
  ...props
}: PropertyEditorProps) {
  return (
    <PropertyTypePicker
      value={value.type}
      onChange={(type) => onChange({ ...value, type })}
      extraFields={(currentType) => (
        <Box sx={{ mt: 2 }}>
          <PropertyValueEditor
            type={currentType}
            name="Default value"
            onChange={() => {}}
          />
        </Box>
      )}
      {...props}
    />
  );
}
