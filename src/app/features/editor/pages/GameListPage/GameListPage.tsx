import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { useCreateGame } from "../../hooks/useCreateGame";
import { GameCard } from "./GameCard";

export default function GameListPage() {
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const createGame = useCreateGame();

  return (
    <Page>
      <Header>Your games</Header>

      <CardGrid>
        <Card sx={{ position: "relative", minHeight: 252 }}>
          <Center>
            <Button
              variant="contained"
              sx={{ whiteSpace: "nowrap" }}
              onClick={createGame}
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
