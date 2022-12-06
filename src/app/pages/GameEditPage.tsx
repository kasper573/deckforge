import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { LinkListItem } from "../components/Link";
import { Page } from "../layout/Page";
import { router } from "../router";
import { trpc } from "../trpc";
import { TextField } from "../controls/TextField";
import { useToastMutation } from "../hooks/useToastMutation";

export default function GameEditPage() {
  const { gameId } = useRouteParams(router.build().game);
  const game = trpc.game.read.useQuery(gameId);
  const renameGame = useToastMutation(trpc.game.rename);

  return (
    <Page>
      <Header>
        <TextField
          debounce
          label="Game name"
          value={game.data?.name ?? ""}
          onValueChange={(name) => renameGame.mutate({ gameId, name })}
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
