import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export interface CodeEditorExtraLib {
  name: string;
  code: string;
}

export interface CodeEditorProps {
  value?: string;
  onChange: (value: string) => void;
  libs?: CodeEditorExtraLib[];
}

export function CodeEditor({ value = "", libs, onChange }: CodeEditorProps) {
  const control = useDebouncedControl({ value, onChange });
  useApi(libs);

  return (
    <Editor
      defaultLanguage="typescript"
      theme="vs-dark"
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
    />
  );
}

function useApi(libs?: CodeEditorExtraLib[]) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco || !libs) {
      return;
    }

    console.log("updating libs", libs);
    const disposables = libs.map((lib) =>
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        lib.code,
        `ts:filename/${lib.name}.d.ts`
      )
    );

    return () => disposables.forEach((d) => d.dispose());
  }, [monaco, libs]);
}
