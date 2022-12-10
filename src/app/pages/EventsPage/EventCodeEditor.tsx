import Box from "@mui/material/Box";
import { CodeEditor } from "../../components/CodeEditor";
import { useSelector } from "../../store";
import { editorActions, selectors } from "../../features/editor/editorState";
import { useActions } from "../../../lib/useActions";
import type { ActionId, ReactionId } from "../../../api/services/game/types";

export function EventCodeEditor() {
  const selectedObject = useSelector(selectors.selectedObject);
  if (selectedObject) {
    switch (selectedObject.type) {
      case "action":
        return <ActionEditor actionId={selectedObject.actionId} />;
      case "reaction":
        return <ReactionEditor reactionId={selectedObject.reactionId} />;
    }
  }
  return <Box sx={{ p: 2 }}>Select an event to edit</Box>;
}

function ActionEditor({ actionId }: { actionId: ActionId }) {
  const action = useSelector(selectors.action(actionId));
  const { updateAction } = useActions(editorActions);

  return (
    <CodeEditor
      value={action?.code}
      onChange={(code) => updateAction({ actionId, code })}
    />
  );
}

function ReactionEditor({ reactionId }: { reactionId: ReactionId }) {
  const reaction = useSelector(selectors.reaction(reactionId));
  const { updateReaction } = useActions(editorActions);

  return (
    <CodeEditor
      value={reaction?.code}
      onChange={(code) => updateReaction({ reactionId, code })}
    />
  );
}
