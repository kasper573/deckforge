import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { EditableListItem } from "../../../components/EditableListItem";
import { Header } from "../../../components/Header";
import { CodeEditor } from "../../../components/CodeEditor";
import { SideMenu } from "../../../components/SideMenu";

export default function ActionEditPage() {
  return (
    <>
      <Header>ActionEditPage</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <List dense>
            <EditableListItem readOnly>
              <ListItemText primary="drawCard" />
            </EditableListItem>
            <EditableListItem readOnly>
              <ListItemText primary="playCard" />
            </EditableListItem>
            <EditableListItem readOnly>
              <ListItemText primary="discardCard" />
            </EditableListItem>
            <EditableListItem>
              <ListItemText primary="Custom action" />
            </EditableListItem>
          </List>
          <Button sx={{ ml: 2 }} variant="contained">
            Create action
          </Button>
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </>
  );
}
