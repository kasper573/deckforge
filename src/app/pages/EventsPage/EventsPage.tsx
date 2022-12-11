import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Header } from "../../components/Header";
import { SideMenu } from "../../components/SideMenu";
import { Page } from "../../layout/Page";
import { useModal } from "../../../lib/useModal";
import { PromptDialog } from "../../dialogs/PromptDialog";
import { useSelector } from "../../store";
import { useActions } from "../../../lib/useActions";
import { editorActions } from "../../features/editor/actions";
import { selectors } from "../../features/editor/selectors";
import { EventCodeEditor } from "./EventCodeEditor";
import { ActionListItem } from "./ActionListItem";

export default function EventsPage() {
  return (
    <Page>
      <Header>Events</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu sx={{ position: "relative" }}>
          <EventList />
        </SideMenu>
        <Paper sx={{ flex: 1, position: "relative" }}>
          <EventCodeEditor />
        </Paper>
      </Stack>
    </Page>
  );
}

function EventList() {
  const actions = useSelector(selectors.actions);
  const { createAction } = useActions(editorActions);

  const prompt = useModal(PromptDialog);
  return (
    <>
      <Button
        variant="contained"
        onClick={() =>
          prompt({
            title: `Add action`,
            fieldProps: { label: "Action name" },
          }).then((name) => name && createAction({ name, code: "" }))
        }
      >
        Create action
      </Button>
      <List dense>
        {actions.map((action) => (
          <ActionListItem key={action.actionId} {...action} />
        ))}
        {actions.length === 0 && (
          <Typography>This game contains no actions yet!</Typography>
        )}
      </List>
    </>
  );
}
