import type { ZodType } from "zod";
import Box from "@mui/material/Box";
import { propertyValue } from "../../api/services/game/types";
import { PropertyValueEditor } from "../features/editor/panels/InspectorPanel/PropertyValueEditor";
import type { ZodPickerProps } from "./ZodPicker";
import { ZodPicker } from "./ZodPicker";

export function PropertyTypePicker<T extends ZodType>(
  props: ZodPickerProps<T>
) {
  return (
    <ZodPicker
      label="Type"
      helperText={propertyValueTypeDescription}
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

const quotedPrimitiveNames = Object.keys(propertyValue.primitiveTypes).map(
  (n) => `"${n}"`
);

const propertyValueTypeDescription = `Can be one of ${quotedPrimitiveNames.join(
  ", "
)} or a json object where the key is any property name, and the value is the type of that property.`;
