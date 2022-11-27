import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import { Page } from "../layout/Page";
import { LinkListItem } from "../components/Link";
import { router } from "../router";

export default function GameBrowsePage() {
  return (
    <Page>
      GameBrowsePage
      <Paper sx={{ mt: 2 }}>
        <List>
          <LinkListItem to={router.play().game({ gameId: "foo" })}>
            Play Foo
          </LinkListItem>
          <LinkListItem to={router.play().game({ gameId: "bar" })}>
            Play Bar
          </LinkListItem>
          <LinkListItem to={router.play().game({ gameId: "baz" })}>
            Play Baz
          </LinkListItem>
        </List>
      </Paper>
    </Page>
  );
}
