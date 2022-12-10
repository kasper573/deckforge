import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";
import type { GameId } from "../../api/services/game/types";

export default function GameBrowsePage() {
  return (
    <Page>
      GameBrowsePage
      <Paper sx={{ mt: 2 }}>
        <List>
          <LinkListItem to={router.play().game({ gameId: "foo" as GameId })}>
            Play Foo
          </LinkListItem>
          <LinkListItem to={router.play().game({ gameId: "bar" as GameId })}>
            Play Bar
          </LinkListItem>
          <LinkListItem to={router.play().game({ gameId: "baz" as GameId })}>
            Play Baz
          </LinkListItem>
        </List>
      </Paper>
    </Page>
  );
}
