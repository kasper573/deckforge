import type { ZodType } from "zod";
import { propertyValue } from "../../api/services/game/types";
import type { ZodPickerProps } from "./ZodPicker";
import { ZodPicker } from "./ZodPicker";

export function PropertyTypePicker<T extends ZodType>(
  props: ZodPickerProps<T>
) {
  return <ZodPicker helperText={propertyValueTypeDescription} {...props} />;
}

const quotedPrimitiveNames = Object.keys(propertyValue.primitiveTypes).map(
  (n) => `"${n}"`
);

const propertyValueTypeDescription = `Can be one of ${quotedPrimitiveNames.join(
  ", "
)} or a json object where the key is any property name, and the value is the type of that property.`;
