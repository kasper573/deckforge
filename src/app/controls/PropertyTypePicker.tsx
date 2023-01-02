import { propertyValue } from "../../api/services/game/types";
import type { ZodPickerProps } from "./ZodPicker";
import { ZodPicker } from "./ZodPicker";

export type PropertyTypePickerProps = Omit<
  ZodPickerProps<typeof propertyValue.serializedType>,
  "schema"
>;

export function PropertyTypePicker(props: PropertyTypePickerProps) {
  return (
    <ZodPicker
      label="Type"
      schema={propertyValue.serializedType}
      helperText={propertyValueTypeDescription}
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
