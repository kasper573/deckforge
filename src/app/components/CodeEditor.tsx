import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { v4 } from "uuid";
import type { editor } from "monaco-editor";
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
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  useTypeDefs(
    typeDefs,
    () => editorRef.current && refreshEditor(editorRef.current)
  );

  return (
    <Editor
      language="typescript"
      theme="vs-dark"
      onMount={(editor) => (editorRef.current = editor)}
      value={control.value}
      onChange={(newValue = "") => control.setValue(newValue)}
    />
  );
}

function refreshEditor(editor: editor.IStandaloneCodeEditor) {
  const original = editor.getValue();
  editor.setValue(original + " ");
  editor.setValue(original);
}

function useTypeDefs(
  typeDefs: CodeEditorTypeDefs | undefined,
  forceRefresh: () => void
) {
  const monaco = useMonaco();
  const forceRefreshRef = useRef(forceRefresh);
  forceRefreshRef.current = forceRefresh;

  useEffect(() => {
    if (!monaco || !typeDefs) {
      return;
    }

    const model = monaco.editor.createModel(
      typeDefs,
      "typescript",
      monaco.Uri.parse(`file://${v4()}/global/index.d.ts`)
    );

    forceRefreshRef.current();

    return () => {
      model.dispose();
    };
  }, [monaco, typeDefs]);
}
