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

export default function CardEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { cardId } = useRouteParams(
    router.build().game({ gameId }).deck().edit({ deckId }).card
  );
  const { data: card } = trpc.card.read.useQuery(cardId);
  const renameCard = trpc.card.rename.useMutation();
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
          <PropertyEditor />
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </Page>
  );
}
