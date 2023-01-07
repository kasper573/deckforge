import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import type { Property } from "../../api/services/game/types";
import { PropertyValueEditor } from "../features/editor/panels/InspectorPanel/PropertyValueEditor";
import type { PropertyValueType } from "../../api/services/game/types";
import type { PropertyTypePickerProps } from "./PropertyTypePicker";
import { PropertyTypePicker } from "./PropertyTypePicker";

export interface PropertyEditorProps
  extends Omit<PropertyTypePickerProps, "value" | "property" | "onChange"> {
  property: Property;
  onChange: (updatedProperty: Property) => void;
}

export function PropertyEditor({
  property,
  onChange,
  ...props
}: PropertyEditorProps) {
  const defaultValueRef = useRef(property.defaultValue);
  useEffect(() => {
    defaultValueRef.current = property.defaultValue;
  }, [property.defaultValue]);
  return (
    <PropertyTypePicker
      value={property.type}
      onChange={(type) =>
        onChange({ ...property, type, defaultValue: defaultValueRef.current })
      }
      extraFields={(currentType) => (
        <Box sx={{ mt: 2 }}>
          <PropertyValueEditor
            type={currentType}
            name="Default value"
            value={defaultValueRef.current as PropertyValueType}
            onChange={(newDefaultValue) => {
              defaultValueRef.current = newDefaultValue;
            }}
          />
        </Box>
      )}
      {...props}
    />
  );
}
