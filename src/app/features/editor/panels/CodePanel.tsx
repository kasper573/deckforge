import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import type {
  ActionId,
  CardId,
  ReactionId,
} from "../../../../api/services/game/types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { CodeEditor } from "../../../components/CodeEditor";
import { Panel } from "../components/Panel";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { PanelProps } from "./definition";

export function CodePanel(props: PanelProps) {
  return (
    <Panel title="Code" {...props}>
      <ObjectCodeEditor />
    </Panel>
  );
}

export function ObjectCodeEditor() {
  const id = useSelector(selectors.selectedObject);
  if (!id) {
    return <PanelEmptyState>Select an object to edit its code</PanelEmptyState>;
  }
  switch (id.type) {
    case "card":
      return <CardCodeEditor cardId={id.cardId} />;
    case "action":
      return <ActionCodeEditor actionId={id.actionId} />;
    case "reaction":
      return <ReactionCodeEditor reactionId={id.reactionId} />;
  }
  return (
    <PanelEmptyState>
      Objects of type {`"${id.type}"`} has no code that can be edited
    </PanelEmptyState>
  );
}

function ActionCodeEditor({ actionId }: { actionId: ActionId }) {
  const action = useSelector(selectors.action(actionId));
  const { updateAction } = useActions(editorActions);

  return (
    <CodeEditor
      value={action?.code}
      onChange={(code) => updateAction({ actionId, code })}
    />
  );
}

function ReactionCodeEditor({ reactionId }: { reactionId: ReactionId }) {
  const reaction = useSelector(selectors.reaction(reactionId));
  const { updateReaction } = useActions(editorActions);

  return (
    <CodeEditor
      value={reaction?.code}
      onChange={(code) => updateReaction({ reactionId, code })}
    />
  );
}

function CardCodeEditor({ cardId }: { cardId: CardId }) {
  const card = useSelector(selectors.card(cardId));
  const { updateCard } = useActions(editorActions);

  return (
    <CodeEditor
      value={card?.code}
      onChange={(code) => updateCard({ cardId, code })}
    />
  );
}
