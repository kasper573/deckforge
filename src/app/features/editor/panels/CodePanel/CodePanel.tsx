import Button from "@mui/material/Button";
import { useSelector } from "../../../../store";
import { selectors } from "../../selectors";

import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import type { CodeEditorTypeDefs } from "../../../../components/CodeEditor";
import { CodeEditor } from "../../../../components/CodeEditor";
import { Panel } from "../../components/Panel";
import { PanelEmptyState } from "../../components/PanelEmptyState";
import type { EditorState } from "../../types";
import { PanelTitle } from "../../components/PanelTitle";
import { PanelControls } from "../../components/PanelControls";
import { useModal } from "../../../../../lib/useModal";
import type { PanelProps } from "../definition";
import { ApiReferenceDialog } from "./ApiReferenceDialog";

export function CodePanel({ title, ...props }: PanelProps) {
  const { objectSelector, typeDefs, update, error } = useEditorProps();
  const object = useSelector(objectSelector);
  const id = useSelector(selectors.selectedObject);
  const breadcrumbs = useSelector(selectors.selectedObjectBreadcrumbs);
  const showApiReference = useModal(ApiReferenceDialog);

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
      toolbarControls={
        <PanelControls>
          <Button size="small" onClick={() => showApiReference(typeDefs)}>
            API Reference
          </Button>
        </PanelControls>
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
        typeDefs: editorApi?.card.typeDefs,
        objectSelector: selectors.card(id.cardId),
        update: (code) => actions.updateCard({ ...id, code }),
      };
    case "event":
      return {
        typeDefs: editorApi?.event.typeDefs,
        objectSelector: selectors.event(id.eventId),
        update: (code) => actions.updateEvent({ ...id, code }),
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
