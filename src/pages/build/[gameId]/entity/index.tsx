import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import Link from "../../../../components/Link";
import { Edit } from "../../../../components/icons";
import { Header } from "../../../../components/Header";

export default function EntityListPage() {
  return (
    <>
      <Header>EntityListPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <EntityListItem name="Player" />
          <EntityListItem name="Card" />
        </List>
      </Paper>
    </>
  );
}

export function EntityListItem({ name }: { name: string }) {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          component={Link}
          href="/build/gameId/entity/entityId"
          aria-label="edit"
        >
          <Edit />
        </IconButton>
      }
    >
      <ListItemText primary={name} />
    </ListItem>
  );
}
