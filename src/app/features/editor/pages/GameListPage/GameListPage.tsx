import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import Button from "@mui/material/Button";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { router } from "../../../../router";
import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { gameType } from "../../../../../api/services/game/types";
import { getDefaultGameDefinition } from "../../getDefaultGameDefinition";
import { GameCard } from "./GameCard";

export default function GameListPage() {
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
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
      allowCancellation: false,
    });

    if (!name) {
      return;
    }

    const definition = await getDefaultGameDefinition();
    const { gameId } = await createGame.mutateAsync({ name, definition });
    history.push(router.editor().edit({ gameId }).$);
  }

  return (
    <Page>
      <Header>Your games</Header>

      <CardGrid>
        <Card sx={{ position: "relative", minHeight: 252 }}>
          <Center>
            <Button
              variant="contained"
              sx={{ whiteSpace: "nowrap" }}
              onClick={createGameAndGotoEditor}
            >
              Create game
            </Button>
          </Center>
        </Card>
        {games.data?.entities.map((game) => (
          <GameCard key={game.gameId} {...game} />
        ))}
      </CardGrid>
    </Page>
  );
}

const CardGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  grid-gap: 1rem;
`;
