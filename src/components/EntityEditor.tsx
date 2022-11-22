import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { Delete, Edit } from "./icons";

export function EntityEditor() {
  return (
    <>
      <List sx={{ mb: 2 }}>
        <PropertyListItem name="Health" type="number" readOnly />
        <PropertyListItem name="Attack" type="number" readOnly />
        <PropertyListItem name="Defense" type="number" />
        <PropertyListItem name="Type" type="Enum (Attack, Block, Status)" />
      </List>
      <Button variant="contained">Create new property</Button>
    </>
  );
}

export function PropertyListItem({
  name,
  type,
  readOnly,
}: {
  name: string;
  type: string;
  readOnly?: boolean;
}) {
  return (
    <ListItem
      sx={{ opacity: readOnly ? 0.5 : 1 }}
      secondaryAction={
        !readOnly && (
          <>
            <IconButton aria-label="edit">
              <Edit />
            </IconButton>
            <IconButton edge="end" aria-label="delete">
              <Delete />
            </IconButton>
          </>
        )
      }
    >
      <ListItemText primary={name} secondary={type} />
    </ListItem>
  );
}
