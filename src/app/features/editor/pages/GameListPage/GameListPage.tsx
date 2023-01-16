import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { GameCard } from "./GameCard";

export default function GameListPage() {
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });

  return (
    <Page>
      <Header>Your games</Header>
      {games.data?.total === 0 ? (
        <Center>
          <Typography paragraph>You have no games yet</Typography>
        </Center>
      ) : (
        <CardGrid>
          {games.data?.entities.map((game) => (
            <GameCard key={game.gameId} {...game} />
          ))}
        </CardGrid>
      )}
    </Page>
  );
}

const CardGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  grid-gap: 1rem;
`;
