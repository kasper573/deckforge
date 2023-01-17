import { useHistory } from "react-router";
import { useToastProcedure } from "../../../hooks/useToastProcedure";
import { trpc } from "../../../trpc";
import { router } from "../../../router";
import { getDefaultGameDefinition } from "../getDefaultGameDefinition";
import { useModal } from "../../../../lib/useModal";
import { PromptDialog } from "../../../dialogs/PromptDialog";
import { gameType } from "../../../../api/services/game/types";

export function useCreateGame() {
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);
  const prompt = useModal(PromptDialog);

  if (createGame.isSuccess || createGame.isLoading) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor() {
    const name = await prompt({
      title: "Create game",
      label: "Game name",
      schema: gameType.shape.name,
    });

    if (!name) {
      return;
    }

    try {
      const { gameId } = await createGame.mutateAsync({
        name,
        definition: await getDefaultGameDefinition(),
      });
      history.push(router.editor({ gameId }).$);
    } catch {}
  }

  return createGameAndGotoEditor;
}
