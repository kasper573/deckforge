import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { v4 } from "uuid";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export type CodeEditorTypeDefs = string;

export interface CodeEditorProps {
  value?: string;
  onChange: (value: string) => void;
  typeDefs?: CodeEditorTypeDefs;
}

export function CodeEditor({
  value = "",
  typeDefs,
  onChange,
}: CodeEditorProps) {
  const control = useDebouncedControl({ value, onChange });
  useTypeDefs(typeDefs);

  return (
    <Editor
      language="typescript"
      theme="vs-dark"
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
    />
  );
}

function useTypeDefs(typeDefs?: CodeEditorTypeDefs) {
  const monaco = useMonaco();
  useEffect(() => {
    if (!monaco || !typeDefs) {
      return;
    }

    const model = monaco.editor.createModel(
      typeDefs,
      "typescript",
      monaco.Uri.parse(`file://${v4()}/global/index.d.ts`)
    );

    return () => {
      model.dispose();
    };
  }, [monaco, typeDefs]);
}
