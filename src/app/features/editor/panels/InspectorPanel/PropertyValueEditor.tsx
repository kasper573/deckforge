import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import type { ComponentType, HTMLAttributes } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import produce from "immer";
import type {
  Property,
  PropertyDefaults,
  PropertyValue,
  PropertyValueTypes,
  TypeOfPropertyValue,
} from "../../../../../api/services/game/types";
import { ZodControl } from "../../../../controls/ZodControl";
import { propertyValue } from "../../../../../api/services/game/types";
import { useDebouncedControl } from "../../../../hooks/useDebouncedControl";

export function PropertyDefaultsEditor({
  properties,
  defaults,
  onChange,
}: {
  properties: Property[];
  defaults: PropertyDefaults;
  onChange: (updated: PropertyDefaults) => void;
}) {
  return (
    <List>
      {properties.map(
        <ValueType extends PropertyValue>({
          propertyId,
          name,
          type,
        }: Property) => (
          <PropertyValueEditor
            key={propertyId}
            type={type}
            name={name}
            value={propertyValue.assert(defaults[propertyId], type)}
            onChange={(newValue) =>
              onChange(
                produce(defaults, (draft) => {
                  draft[propertyId] = newValue;
                })
              )
            }
          />
        )
      )}
    </List>
  );
}

export function PropertyValueEditor<
  ValueType extends PropertyValue,
  Foo extends keyof PropertyValueTypes
>({
  type,
  name,
  value,
  onChange,
}: {
  type: ValueType;
  name: string;
  value: TypeOfPropertyValue<ValueType>;
  onChange: (newValue: TypeOfPropertyValue<ValueType>) => void;
}) {
  const control = useDebouncedControl({ value, onChange });

  let content: JSX.Element = <></>;
  if (propertyValue.isObject(type)) {
    content = (
      <ZodControl
        schema={propertyValue.resolverOf(type)}
        value={control.value}
        onChange={control.setValue}
        label={name}
      />
    );
  } else if (propertyValue.isTypeName(type)) {
    const PrimitiveControl = primitiveControls[type] as ComponentType<
      ControlProps<TypeOfPropertyValue<ValueType>>
    >;
    content = (
      <PrimitiveControl
        label={name}
        value={control.value}
        onChange={control.setValue}
      />
    );
  }

  return <ListItem>{content}</ListItem>;
}

type ControlProps<Value> = {
  label?: string;
  value: Value;
  onChange: (value: Value) => void;
} & Omit<HTMLAttributes<unknown>, "onChange">;

const primitiveControls: {
  [K in keyof PropertyValueTypes]: ComponentType<
    ControlProps<PropertyValueTypes[K]>
  >;
} = {
  boolean: ({ label, value, onChange }) => (
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          size="small"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
    />
  ),
  string: ({ label, value, onChange }) => (
    <TextField
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  number: ({ label, value, onChange }) => (
    <TextField
      size="small"
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange((e.target as HTMLInputElement).valueAsNumber)}
    />
  ),
};
