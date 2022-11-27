import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { EditableListItem } from "./EditableListItem";

export function EntityEditor() {
  return (
    <>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <EditableListItem readOnly>
            <ListItemText primary="Health" secondary="number" />
          </EditableListItem>
          <EditableListItem readOnly>
            <ListItemText primary="Attack" secondary="number" />
          </EditableListItem>
          <EditableListItem>
            <ListItemText primary="Defense" secondary="number" />
          </EditableListItem>
          <EditableListItem>
            <ListItemText
              primary="Type"
              secondary="Enum (Attack, Block, Status)"
            />
          </EditableListItem>
        </List>
      </Paper>
      <Button variant="contained">Create new property</Button>
    </>
  );
}
