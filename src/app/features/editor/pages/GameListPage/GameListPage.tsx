import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import Button from "@mui/material/Button";
import { useStore } from "zustand";
import { z } from "zod";
import MenuItem from "@mui/material/MenuItem";
import { Page } from "../../../layout/Page";
import { trpc } from "../../../../trpc";
import { Header } from "../../../layout/Header";
import { Center } from "../../../../components/Center";

import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { useModal } from "../../../../../lib/useModal";
import {
  gameType,
  gameTypeIdType,
} from "../../../../../api/services/game/types";
import { authStore } from "../../../auth/store";
import { shouldUseOfflineGameService } from "../../../../../api/services/game/offline";
import { FormDialog } from "../../../../dialogs/FormDialog";
import { DialogTextField } from "../../../../controls/DialogTextField";
import { SelectFormControl } from "../../../../controls/Select";
import { router } from "../../../../router";
import { gameTypeList, gameTypes } from "../../../gameTypes";
import { GameCard } from "./GameCard";

export default function GameListPage() {
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const history = useHistory();
  const createGame = useToastProcedure(trpc.game.create);
  const prompt = useModal(FormDialog);
  const isLocalDeviceData = shouldUseOfflineGameService(useStore(authStore));

  if (createGame.isSuccess || createGame.isLoading) {
    throw new Promise(() => {}); // Trigger suspense
  }

  async function createGameAndGotoEditor() {
    const promptResult = await prompt({
      title: "Create game",
      schema: z.object({
        name: gameType.shape.name,
        typeId: gameTypeIdType,
      }),
      layout: (form) => (
        <>
          <DialogTextField label="Name" autoFocus {...form.register("name")} />
          <SelectFormControl
            label="Type"
            size="small"
            defaultValue={gameTypeList[0].id}
            sx={{ mt: 2 }}
            {...form.register("typeId")}
          >
            {gameTypeList.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </SelectFormControl>
        </>
      ),
    });

    if (promptResult.type === "cancel") {
      return;
    }

    const selectedGameType = gameTypes[promptResult.value.typeId];
    const { gameId } = await createGame.mutateAsync({
      name: promptResult.value.name,
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
