import Button from "@mui/material/Button";
import { useMemo } from "react";
import { useSelector } from "../../store";
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
  const id = useSelector(selectors.selectedObjectId);
  const idAsKey = useMemo(() => JSON.stringify(id), [id]);
  const breadcrumbs = useSelector(selectors.selectedObjectBreadcrumbs);
  const showApiReference = useModal(ApiReferenceDialog);

  const content = error ? (
    <PanelEmptyState>{error}</PanelEmptyState>
  ) : (
    <CodeEditor
      key={idAsKey} // Forced remount per unique object avoids invalid onChange events when selecting objects
      value={object?.code}
      onChange={update}
      typeDefs={typeDefs}
    />
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
          <Button
            size="small"
            disabled={!typeDefs}
            onClick={() => showApiReference(typeDefs)}
          >
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
  const id = useSelector(selectors.selectedObjectId);
  const actions = useActions(editorActions);
  const editorApi = useSelector(selectors.editorApi);
  const events = useSelector(selectors.events);

  switch (id?.type) {
    case "card":
      return {
        typeDefs: editorApi?.card,
        objectSelector: selectors.card(id.cardId),
        update: (code) => actions.updateCard({ ...id, code }),
      };
    case "event":
      const eventName = events.find((e) => e.eventId === id.eventId)?.name;
      return {
        typeDefs: eventName ? editorApi?.events[eventName] : undefined,
        objectSelector: selectors.event(id.eventId),
        update: (code) => actions.updateEvent({ ...id, code }),
      };
    case "reducer":
      return {
        typeDefs: editorApi?.reducer,
        objectSelector: selectors.reducer(id.reducerId),
        update: (code) => actions.updateReducer({ ...id, code }),
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
