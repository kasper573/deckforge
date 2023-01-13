import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { gameType } from "../../../../../api/services/game/types";
import { useCreateGame } from "../../hooks/useCreateGame";
import { GameCard } from "./GameCard";

export default function GameListPage() {
  const prompt = useModal(PromptDialog);

  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const createGame = useCreateGame();

  async function enterNameAndCreateGame() {
    const name = await prompt({
      title: "Create new game",
      label: "Game name",
      schema: gameType.shape.name,
    });
    if (!name) {
      return;
    }
    createGame(name);
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
