import type { Action, Reaction } from "@prisma/client";
import Box from "@mui/material/Box";
import { trpc } from "../../trpc";
import { useToastMutation } from "../../hooks/useToastMutation";
import { CodeEditor } from "../../components/CodeEditor";
import { useEventsPageState } from "./eventsPageState";

export function EventCodeEditor() {
  const { activeObjectId } = useEventsPageState();
  if (activeObjectId) {
    switch (activeObjectId.type) {
      case "action":
        return <ActionEditor actionId={activeObjectId.actionId} />;
      case "reaction":
        return <ReactionEditor reactionId={activeObjectId.reactionId} />;
    }
  }
  return <Box sx={{ p: 2 }}>Select an event to edit</Box>;
}

function ActionEditor({ actionId }: { actionId: Action["actionId"] }) {
  const { data: action } = trpc.event.action.useQuery(actionId);
  const updateAction = useToastMutation(trpc.event.updateAction);

  return (
    <CodeEditor
      value={action?.code}
      onChange={(code) => updateAction.mutate({ actionId, code })}
    />
  );
}

function ReactionEditor({
  reactionId,
}: {
  reactionId: Reaction["reactionId"];
}) {
  const { data: reaction } = trpc.event.reaction.useQuery(reactionId);
  const updateReaction = useToastMutation(trpc.event.updateReaction);

  return (
    <CodeEditor
      value={reaction?.code}
      onChange={(code) => updateReaction.mutate({ reactionId, code })}
    />
  );
}
