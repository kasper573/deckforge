import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export type CodeEditorApi = string;

export interface CodeEditorProps {
  value?: string;
  onChange: (value: string) => void;
  api?: CodeEditorApi;
}

export function CodeEditor({ value = "", api, onChange }: CodeEditorProps) {
  const control = useDebouncedControl({ value, onChange });
  useApi(api);

  return (
    <Editor
      defaultLanguage="typescript"
      theme="vs-dark"
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
    />
  );
}

function useApi(api?: CodeEditorApi) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco || !api) {
      return;
    }

    const disposable =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        api,
        `ts:filename/code-editor-inline-api.d.ts`
      );

    return () => disposable.dispose();
  }, [monaco, api]);
}
