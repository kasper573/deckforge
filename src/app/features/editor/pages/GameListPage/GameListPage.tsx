import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import Button from "@mui/material/Button";
import { useStore } from "zustand";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { useModal } from "../../../../../lib/useModal";

import { authStore } from "../../../auth/store";
import { shouldUseOfflineGameService } from "../../../../../api/services/game/offline";
import { router } from "../../../../router";
import { gameTypes } from "../../../gameTypes";
import { GameCard } from "./GameCard";
import { SelectGameTypeDialog } from "./SelectGameTypeDialog";

export default function GameListPage() {
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);
  const selectGameType = useModal(SelectGameTypeDialog);
  const isLocalDeviceData = shouldUseOfflineGameService(useStore(authStore));

  if (createGame.isSuccess || createGame.isLoading) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor() {
    const gameTypeId = await selectGameType();
    if (!gameTypeId) {
      return;
    }

    const selectedGameType = gameTypes.get(gameTypeId);
    if (!selectedGameType) {
      // This should really never happen, but throwing for type safety
      throw new Error("Could not find game type");
    }

    const { gameId } = await createGame.mutateAsync({
      name: "New game",
      definition: selectedGameType.defaultGameDefinition,
      type: selectedGameType.id,
    });

    history.push(router.editor().edit({ gameId }).$);
  }

  return (
    <Page>
      <Header>
        {isLocalDeviceData ? "Games on this device" : "Your games"}
      </Header>

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
