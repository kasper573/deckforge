import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { Header } from "../components/Header";
import { LinkListItem } from "../components/Link";
import { Page } from "../layout/Page";
import { router } from "../router";
import { TextField } from "../controls/TextField";
import { useSelector } from "../store";
import { editorActions, selectors } from "../features/editor/editorState";
import { useActions } from "../../lib/useActions";

export default function GameEditPage() {
  const { renameGame } = useActions(editorActions);
  const { name, gameId } = useSelector(selectors.game);

  return (
    <Page>
      <Header>
        <TextField
          debounce
          label="Game name"
          value={name}
          onValueChange={renameGame}
        />
      </Header>
      <Paper sx={{ mb: 3 }}>
        <List dense>
          <LinkListItem to={router.build().game({ gameId }).deck()}>
            <ListItemText primary="Decks" />
          </LinkListItem>
          <LinkListItem to={router.build().game({ gameId }).entity()}>
            <ListItemText primary="Entities" />
          </LinkListItem>
          <LinkListItem to={router.build().game({ gameId }).events()}>
            <ListItemText primary="Events" />
          </LinkListItem>
        </List>
      </Paper>
    </Page>
  );
}
