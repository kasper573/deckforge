import Stack from "@mui/material/Stack";
import { useRouteParams } from "react-typesafe-routes";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { Header } from "../components/Header";
import { CodeEditor } from "../components/CodeEditor";
import { PropertiesEditor } from "../components/PropertyEditor";
import { SideMenu } from "../components/SideMenu";
import { Page } from "../layout/Page";
import { router } from "../router";
import { useSelector } from "../store";
import { useActions } from "../../lib/useActions";
import { editorActions } from "../features/editor/actions";
import { selectors } from "../features/editor/selectors";

export default function CardEditPage() {
  const { gameId } = useSelector(selectors.game);
  const { deckId } = useRouteParams(
    router.build().game({ gameId }).deck().edit
  );
  const { cardId } = useRouteParams(
    router.build().game({ gameId }).deck().edit({ deckId }).card
  );
  const properties = useSelector(selectors.propertiesFor("card"));
  const card = useSelector(selectors.card(cardId));
  const { updateCard } = useActions(editorActions);

  return (
    <Page>
      <Header>
        <TextField
          label="Card name"
          value={card?.name ?? ""}
          onChange={(e) => updateCard({ cardId, name: e.target.value })}
        />
      </Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          {properties && (
            <PropertiesEditor
              properties={properties}
              values={card?.propertyDefaults ?? {}}
              onChange={(propertyDefaults) =>
                updateCard({ cardId, propertyDefaults })
              }
            />
          )}
        </SideMenu>
        <Paper sx={{ flex: 1 }}>
          <CodeEditor
            value={card?.code}
            onChange={(code) => updateCard({ cardId, code })}
          />
        </Paper>
      </Stack>
    </Page>
  );
}
