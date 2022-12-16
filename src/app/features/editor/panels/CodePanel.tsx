import { useSelector } from "../../../store";
import { selectors } from "../selectors";

import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import type { CodeEditorTypeDefs } from "../../../components/CodeEditor";
import { CodeEditor } from "../../../components/CodeEditor";
import { Panel } from "../components/Panel";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { EditorState } from "../types";
import { PanelTitle } from "../components/PanelTitle";
import type { PanelProps } from "./definition";

export function CodePanel({ title, ...props }: PanelProps) {
  const { objectSelector, typeDefs, update, error } = useEditorProps();
  const object = useSelector(objectSelector);
  const id = useSelector(selectors.selectedObject);
  const breadcrumbs = useSelector(selectors.selectedObjectBreadcrumbs);

  const content = error ? (
    <PanelEmptyState>{error}</PanelEmptyState>
  ) : (
    <CodeEditor value={object?.code} onChange={update} typeDefs={typeDefs} />
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
  typeDefs?: CodeEditorTypeDefs;
  objectSelector: (state: EditorState) => undefined | { code: string };
  update: (code: string) => void;
  error?: string;
} {
  const id = useSelector(selectors.selectedObject);
  const actions = useActions(editorActions);
  const editorApi = useSelector(selectors.editorApi);

  switch (id?.type) {
    case "card":
      return {
        typeDefs: editorApi?.card,
        objectSelector: selectors.card(id.cardId),
        update: (code) => actions.updateCard({ ...id, code }),
      };
    case "action":
      return {
        typeDefs: editorApi?.action,
        objectSelector: selectors.action(id.actionId),
        update: (code) => actions.updateAction({ ...id, code }),
      };
    case "reaction":
      return {
        typeDefs: editorApi?.reaction,
        objectSelector: selectors.reaction(id.reactionId),
        update: (code) => actions.updateReaction({ ...id, code }),
      };
  }

  return {
    objectSelector: () => undefined,
    update: () => {},
    error: id
      ? `Objects of type "${id.type}" has no code that can be edited`
      : "Select an object to edit its code",
  };
}
