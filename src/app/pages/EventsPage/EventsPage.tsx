import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useRouteParams } from "react-typesafe-routes";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Suspense } from "react";
import { Header } from "../../components/Header";
import { SideMenu } from "../../components/SideMenu";
import { Page } from "../../layout/Page";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { useToastProcedure } from "../../hooks/useToastProcedure";
import { useModal } from "../../../lib/useModal";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Center } from "../../components/Center";
import { ActionListItem } from "./ActionListItem";
import { EventCodeEditor } from "./EventCodeEditor";

export default function EventsPage() {
  const { gameId } = useRouteParams(router.build().game);
  const { data: actions } = trpc.event.actions.useQuery(gameId);

  const createAction = useToastProcedure(trpc.event.createAction);
  const prompt = useModal(PromptDialog);

  return (
    <Page>
      <Header>Game: {gameId}</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <Button
            variant="contained"
            onClick={() =>
              prompt({
                title: `Add action`,
                fieldProps: { label: "Action name" },
              }).then(
                (name) =>
                  name && createAction.mutate({ gameId, name, code: "" })
              )
            }
          >
            Create action
          </Button>
          <List dense>
            {actions?.map((action) => (
              <ActionListItem key={action.actionId} {...action} />
            ))}
            {actions?.length === 0 && (
              <Typography>This game contains no actions yet!</Typography>
            )}
          </List>
        </SideMenu>
        <Paper sx={{ flex: 1, position: "relative" }}>
          <Suspense
            fallback={
              <Center>
                <LoadingIndicator />
              </Center>
            }
          >
            <EventCodeEditor />
          </Suspense>
        </Paper>
      </Stack>
    </Page>
  );
}
