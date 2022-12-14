import Button from "@mui/material/Button";
import { useHistory } from "react-router";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { useModal } from "../../../../../lib/useModal";
import { router } from "../../../../router";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";
import { LoadingPage } from "../../../common/LoadingPage";
import { gameType } from "../../../../../api/services/game/types";
import { GameCard } from "./GameCard";

export default function GameListPage() {
  const history = useHistory();
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const createGame = useToastProcedure(trpc.game.create);
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateGame() {
    const name = await prompt({
      title: "Create new game",
      label: "Game name",
      schema: gameType.shape.name,
    });
    if (!name) {
      return;
    }
    try {
      const { gameId } = await createGame.mutateAsync({ name, definition: {} });
      history.push(router.build().game({ gameId }).$);
    } catch {}
  }

  // Creating a game will turn on the loading state indefinitely
  // Once mutation is done, we'll redirect to the game page
  if (createGame.isSuccess || createGame.isLoading) {
    return <LoadingPage />;
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
              onClick={enterNameAndCreateGame}
            >
              Create new game
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
