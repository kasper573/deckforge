import Stack from "@mui/material/Stack";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { CodeEditor } from "../components/CodeEditor";
import { PropertyEditor } from "../components/PropertyEditor";
import { SideMenu } from "../components/SideMenu";
import { Page } from "../layout/Page";
import { router } from "../router";
import { TextField } from "../controls/TextField";
import { trpc } from "../trpc";
import { useToastMutation } from "../hooks/useToastMutation";

export default function CardEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { cardId } = useRouteParams(
    router.build().game({ gameId }).deck().edit({ deckId }).card
  );
  const { data: properties = [] } = trpc.entity.listProperties.useQuery({
    entityId: "card",
    gameId,
  });
  const { data: card } = trpc.card.read.useQuery(cardId);
  const renameCard = useToastMutation(trpc.card.rename);

  return (
    <Page>
      <Header>
        <TextField
          debounce
          label="Card name"
          value={card?.name ?? ""}
          onValueChange={(name) => renameCard.mutate({ cardId, name })}
        />
      </Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <PropertyEditor properties={properties} />
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </Page>
  );
}
