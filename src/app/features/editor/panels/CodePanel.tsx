import { useSelector } from "../../../store";
import { selectors } from "../selectors";

import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import type { CodeEditorApi } from "../../../components/CodeEditor";
import { CodeEditor } from "../../../components/CodeEditor";
import { Panel } from "../components/Panel";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { EditorState } from "../types";
import { PanelTitle } from "../components/PanelTitle";
import type { PanelProps } from "./definition";

export function CodePanel({ title, ...props }: PanelProps) {
  const { objectSelector, apiSelector, update, error } = useEditorProps();
  const api = useSelector(apiSelector);
  const object = useSelector(objectSelector);
  const id = useSelector(selectors.selectedObject);
  const breadcrumbs = useSelector(selectors.selectedObjectBreadcrumbs);

  const content = error ? (
    <PanelEmptyState>{error}</PanelEmptyState>
  ) : (
    <CodeEditor value={object?.code} onChange={update} api={api} />
  );

  return (
    <Panel
      title={
        <PanelTitle
          name={title}
          objectType={id?.type}
          breadcrumbs={breadcrumbs}
        />
      }
      {...props}
    >
      {content}
    </Panel>
  );
}

function useEditorProps(): {
  apiSelector: (state: EditorState) => CodeEditorApi | undefined;
  objectSelector: (state: EditorState) => undefined | { code: string };
  update: (code: string) => void;
  error?: string;
} {
  const id = useSelector(selectors.selectedObject);
  const actions = useActions(editorActions);

  switch (id?.type) {
    case "card":
      return {
        apiSelector: selectors.codeEditorApis.card,
        objectSelector: selectors.card(id.cardId),
        update: (code) => actions.updateCard({ ...id, code }),
      };
    case "action":
      return {
        apiSelector: selectors.codeEditorApis.action,
        objectSelector: selectors.action(id.actionId),
        update: (code) => actions.updateAction({ ...id, code }),
      };
    case "reaction":
      return {
        apiSelector: selectors.codeEditorApis.reaction,
        objectSelector: selectors.reaction(id.reactionId),
        update: (code) => actions.updateReaction({ ...id, code }),
      };
  }

  return {
    apiSelector: () => undefined,
    objectSelector: () => undefined,
    update: () => {},
    error: id
      ? `Objects of type "${id.type}" has no code that can be edited`
      : "Select an object to edit its code",
  };
}
