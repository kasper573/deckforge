import Stack from "@mui/material/Stack";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { CodeEditor } from "../components/CodeEditor";
import type { PropertiesEditorValues } from "../components/PropertyEditor";
import { PropertiesEditor } from "../components/PropertyEditor";
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
  const { data: properties } = trpc.entity.properties.useQuery({
    entityId: "card",
    gameId,
  });
  const { data: card } = trpc.card.read.useQuery(cardId);
  const updateCard = useToastMutation(trpc.card.update);

  return (
    <Page>
      <Header>
        <TextField
          debounce
          label="Card name"
          value={card?.name ?? ""}
          onValueChange={(name) => updateCard.mutate({ cardId, name })}
        />
      </Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          {properties && (
            <PropertiesEditor
              properties={properties}
              values={(card?.propertyDefaults ?? {}) as PropertiesEditorValues}
              onChange={(propertyDefaults) =>
                updateCard.mutate({ cardId, propertyDefaults })
              }
            />
          )}
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </Page>
  );
}
