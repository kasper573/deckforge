import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Header } from "../../../../components/Header";
import { EditableListItem } from "../../../../components/EditableListItem";
import { CodeEditor } from "../../../../components/CodeEditor";

export default function ActionListPage() {
  return (
    <>
      <Header>ActionListPage</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <Box sx={{ width: 250 }}>
          <Paper sx={{ mb: 3 }}>
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
          </Paper>
          <Button variant="contained">Create new action</Button>
        </Box>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </>
  );
}
