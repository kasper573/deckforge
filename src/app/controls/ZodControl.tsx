import type { ZodType, z } from "zod";
import { ZodError } from "zod";
import type { TextFieldProps } from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";

export interface ZodControlProps<T extends ZodType>
  extends Omit<
    TextFieldProps,
    "value" | "onChange" | "multiline" | "type" | "optional" | "error"
  > {
  schema: T;
  value: z.infer<T>;
  onChange: (value: z.infer<T>) => void;
}

export function ZodControl<T extends ZodType>({
  value,
  onChange,
  schema,
  helperText,
  ...props
}: ZodControlProps<T>) {
  const [error, setError] = useState<string>();
  const [json, setJson] = useState(() => readableJson(value));

  const latest = { schema, onChange };
  const latestRef = useRef(latest);
  latestRef.current = latest;

  useEffect(() => {
    try {
      const { schema, onChange } = latestRef.current;
      onChange(schema.parse(JSON.parse(json)));
      setError(undefined);
    } catch (e) {
      setError(e instanceof ZodError ? e.message : `${e}`);
    }
  }, [json, latestRef]);

  return (
    <TextField
      multiline
      error={!!error}
      helperText={error ?? helperText}
      value={json}
      onChange={(e) => setJson(e.target.value)}
      {...props}
    />
  );
}

function readableJson(value: unknown) {
  if (value && typeof value === "object") {
    const entryStrings = Object.entries(value).map(
      ([key, value]) => `"${key}": ${JSON.stringify(value)}`
    );
    return `{\n${entryStrings.join(",\n")}\n}`;
  }
  return JSON.stringify(value);
}
