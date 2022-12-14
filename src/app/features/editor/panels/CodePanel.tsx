import { useSelector } from "../../../store";
import { selectors } from "../selectors";

import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { CodeEditor } from "../../../components/CodeEditor";
import { Panel } from "../components/Panel";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { EditorState } from "../types";
import type { PanelProps } from "./definition";

export function CodePanel(props: PanelProps) {
  const { selector, update, error } = useEditorProps();
  const object = useSelector(selector);

  const content = error ? (
    <PanelEmptyState>{error}</PanelEmptyState>
  ) : (
    <CodeEditor value={object?.code} onChange={update} />
  );

  return <Panel {...props}>{content}</Panel>;
}

function useEditorProps(): {
  selector: (state: EditorState) => undefined | { code: string };
  update: (code: string) => void;
  error?: string;
} {
  const id = useSelector(selectors.selectedObject);
  const actions = useActions(editorActions);

  switch (id?.type) {
    case "card":
      return {
        selector: selectors.card(id.cardId),
        update: (code) => actions.updateCard({ ...id, code }),
      };
    case "action":
      return {
        selector: selectors.action(id.actionId),
        update: (code) => actions.updateAction({ ...id, code }),
      };
    case "reaction":
      return {
        selector: selectors.reaction(id.reactionId),
        update: (code) => actions.updateReaction({ ...id, code }),
      };
  }

  return {
    selector: () => undefined,
    update: () => {},
    error: id
      ? `Objects of type "${id.type}" has no code that can be edited`
      : "Select an object to edit its code",
  };
}
