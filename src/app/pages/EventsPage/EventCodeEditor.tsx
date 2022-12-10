import type { Action, Reaction } from "@prisma/client";
import Box from "@mui/material/Box";
import { CANCEL_INVALIDATE, trpc } from "../../trpc";
import { useToastMutation } from "../../hooks/useToastProcedure";
import { CodeEditor } from "../../components/CodeEditor";
import { useQueryData } from "../../../lib/useQueryData";
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
  const action = trpc.event.action.useQuery(actionId);
  const mutation = useCacheMutation(action, trpc.event.updateAction);
  const updateAction = useToastMutation(mutation.mutateAsync);

  return (
    <CodeEditor
      value={action.data?.code}
      onChange={(code) => updateAction({ actionId, code })}
    />
  );
}

function ReactionEditor({
  reactionId,
}: {
  reactionId: Reaction["reactionId"];
}) {
  const reaction = trpc.event.reaction.useQuery(reactionId);
  const mutation = useCacheMutation(reaction, trpc.event.updateReaction);
  const updateReaction = useToastMutation(mutation.mutateAsync);

  return (
    <CodeEditor
      value={reaction.data?.code}
      onChange={(code) => updateReaction({ reactionId, code })}
    />
  );
}

function useCacheMutation(queryResult: any, mutationProcedure: any) {
  const queryData = useQueryData(queryResult);
  return mutationProcedure.useMutation({
    onSuccess: (data: any) => {
      queryData.set(data);
      return CANCEL_INVALIDATE;
    },
    onMutate: (changes: any) => {
      const existing = queryData.get();
      if (existing) {
        queryData.set({ ...existing, ...changes });
      }
    },
  });
}
