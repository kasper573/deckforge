import Editor from "@monaco-editor/react";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export interface CodeEditorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value = "", onChange }: CodeEditorProps) {
  const control = useDebouncedControl({ value, onChange });
  return (
    <Editor
      defaultLanguage="typescript"
      theme="vs-dark"
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
    />
  );
}
