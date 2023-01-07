import Editor, { useMonaco } from "@monaco-editor/react";
import type { ComponentProps, MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import { v4 } from "uuid";
import type { editor } from "monaco-editor";

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
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const [isRefreshingRef, refreshEditor] = useRefreshEditor(editorRef);
  useTypeDefs(typeDefs, refreshEditor);

  return (
    <CodeEditorWithoutTypedefs
      onMount={(editor) => (editorRef.current = editor)}
      value={value}
      onChange={(newValue = "") => {
        if (!isRefreshingRef.current) {
          onChange(newValue);
        }
      }}
    />
  );
}

export function CodeEditorWithoutTypedefs(
  props: ComponentProps<typeof Editor>
) {
  return (
    <Editor
      language="typescript"
      theme="vs-dark"
      options={{ tabSize: 2, ...props.options }}
      {...props}
    />
  );
}

function useRefreshEditor(
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | undefined>
) {
  const isRefreshingRef = useRef(false);
  function refresh() {
    if (!editorRef.current) {
      return;
    }
    isRefreshingRef.current = true;
    const original = editorRef.current.getValue();
    editorRef.current.setValue(original + " ");
    editorRef.current.setValue(original);
    isRefreshingRef.current = false;
  }
  return [isRefreshingRef, refresh] as const;
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
      monaco.Uri.parse(`file://${v4()}.d.ts`)
    );

    forceRefreshRef.current();

    return () => {
      model.dispose();
    };
  }, [monaco, typeDefs]);
}
