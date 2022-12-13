import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { MosaicBranch } from "react-mosaic-component";
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

export function CodePanel({ path }: { path: MosaicBranch[] }) {
  return (
    <Panel title="Code" path={path}>
      <ObjectCodeEditor />
    </Panel>
  );
}

export function ObjectCodeEditor() {
  const id = useSelector(selectors.selectedObject);
  if (!id) {
    return (
      <EmptyMessage>
        Select an object in the project panel to edit its code
      </EmptyMessage>
    );
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
    <EmptyMessage>
      Objects of type {`"${id.type}"`} has no code that can be edited
    </EmptyMessage>
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

const EmptyMessage = styled(Typography)`
  padding: 16px;
`;