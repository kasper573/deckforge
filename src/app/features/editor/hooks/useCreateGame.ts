import { useHistory } from "react-router";
import { useAuth } from "../../auth/store";
import { useToastProcedure } from "../../../hooks/useToastProcedure";
import { trpc } from "../../../trpc";
import { router } from "../../../router";
import { getDefaultGameDefinition } from "../getDefaultGameDefinition";

export function useCreateGame() {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);

  if (createGame.isSuccess || createGame.isLoading) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor(name: string) {
    if (!isAuthenticated) {
      // Go to the editor without a persisted game
      history.push(router.editor({ gameId: undefined }).$);
      return;
    }

    try {
      // Create the game for the current user and open the editor for that game
      const { gameId } = await createGame.mutateAsync({
        name,
        definition: await getDefaultGameDefinition(),
      });
      history.push(router.editor({ gameId }).$);
    } catch {}
  }

  return createGameAndGotoEditor;
}
