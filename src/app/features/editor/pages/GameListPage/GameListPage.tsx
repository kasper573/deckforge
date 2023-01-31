import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import Button from "@mui/material/Button";
import { useRouteParams } from "react-typesafe-routes";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { useModal } from "../../../../../lib/useModal";

import { router } from "../../../../router";
import { gameTypes } from "../../../gameTypes";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { gameType } from "../../../../../api/services/game/types";
import { useOfflineGameServiceState } from "../../utils/shouldUseOfflineGameService";
import { useReaction } from "../../../../../lib/useReaction";
import { GameCard } from "./GameCard";
import { SelectGameTypeDialog } from "./SelectGameTypeDialog";

export default function GameListPage() {
  const { create } = useRouteParams(router.editor);
  const games = trpc.game.list.useQuery();
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);
  const selectGameType = useModal(SelectGameTypeDialog);
  const prompt = useModal(PromptDialog);
  const isLocalDeviceData = useOfflineGameServiceState();

  useReaction(() => {
    if (create) {
      history.replace(router.editor({}).$);
      createGameAndGotoEditor();
    }
  }, [create]);

  if (createGame.isSuccess) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor() {
    const gameTypeId = await selectGameType();
    const selectedGameType = gameTypeId ? gameTypes.get(gameTypeId) : undefined;
    if (!selectedGameType) {
      return;
    }

    const name = await prompt({
      title: "Enter game name",
      label: "Name",
      schema: gameType.shape.name,
    });
    if (!name) {
      return;
    }

    let game;
    try {
      game = await createGame.mutateAsync({
        name,
        definition: await selectedGameType.defaultGameDefinition(),
        type: selectedGameType.id,
      });
    } catch (err) {
      return;
    }

    history.push(router.editor({}).edit({ gameId: game.gameId }).$);
    return true;
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
        {games.data?.map((game) => (
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
