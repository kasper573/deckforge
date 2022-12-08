import type { PropertyType } from "@prisma/client";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import type { ComponentType, HTMLAttributes } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import produce from "immer";
import type { PropertyRecord } from "../../api/services/entity/types";

type PropertyValues<T extends PropertyRecord> = {
  [K in keyof T]?: ControlValue<T[K]["type"]>;
};

export function PropertiesEditor<Properties extends PropertyRecord>({
  properties,
  values,
  onChange,
}: {
  properties: Properties;
  values: PropertyValues<Properties>;
  onChange: (updated: PropertyValues<Properties>) => void;
}) {
  return (
    <List>
      {Object.entries(properties).map(([unsafeName, { propertyId, type }]) => {
        const name = unsafeName as keyof Properties;
        return (
          <PropertyEditor
            key={propertyId}
            type={type}
            name={name as string}
            value={values[name]}
            onChange={(newValue) =>
              onChange(
                produce(values, (draft: PropertyValues<Properties>) => {
                  draft[name] = newValue;
                })
              )
            }
          />
        );
      })}
    </List>
  );
}

export function PropertyEditor<T extends PropertyType>({
  type,
  name,
  value,
  onChange,
}: {
  type: T;
  name: string;
  value?: ControlValue<T>;
  onChange: (newValue: ControlValue<T>) => void;
}) {
  const ValueControl = controls[type] as Control<ControlValue<T>>;
  return (
    <ListItem>
      <ValueControl label={name} value={value} onChange={onChange} />
    </ListItem>
  );
}

type ControlValue<T extends PropertyType> = typeof controls[T] extends Control<
  infer V
>
  ? V
  : never;

type Control<T> = ComponentType<ControlProps<T>>;

type ControlProps<T> = {
  label?: string;
  value?: T;
  onChange: (value: T) => void;
} & Omit<HTMLAttributes<unknown>, "onChange">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const controls: Record<PropertyType, Control<any>> = {
  boolean: ({ label, value = false, onChange }: ControlProps<boolean>) => (
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
    />
  ),
  string: ({ label, value = "", onChange }: ControlProps<string>) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  number: ({ label, value = 0, onChange }: ControlProps<number>) => (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange((e.target as HTMLInputElement).valueAsNumber)}
    />
  ),
};
