import type { ComponentProps } from "react";
import Editor from "@monaco-editor/react";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export interface CodeEditorProps
  extends Omit<ComponentProps<typeof Editor>, "onChange" | "value"> {
  value?: string;
  onChange: (value: string) => void;
}

export function CodeEditor({
  value = "",
  onChange,
  ...props
}: CodeEditorProps) {
  const control = useDebouncedControl({ value, onChange });
  return (
    <Editor
      defaultLanguage="typescript"
      theme="vs-dark"
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
      {...props}
    />
  );
}
