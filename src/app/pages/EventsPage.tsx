import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/system";
import { useRouteParams } from "react-typesafe-routes";
import { Header } from "../components/Header";
import { CodeEditor } from "../components/CodeEditor";
import { SideMenu } from "../components/SideMenu";
import { Add, Delete, Edit, More } from "../components/icons";
import { Page } from "../layout/Page";
import { router } from "../router";

export default function EventsPage() {
  const { gameId } = useRouteParams(router.build().game);

  return (
    <Page>
      <Header>Game: {gameId}</Header>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
        <SideMenu>
          <Button variant="contained">Create action</Button>
          <List dense>
            <ActionListItem name="drawCard" readOnly />
            <ActionListItem name="playCard" readOnly />
            <ActionListItem name="discardCard" readOnly />
            <ActionListItem name="Custom action" />
          </List>
        </SideMenu>
        <CodeEditor sx={{ flex: 1 }} />
      </Stack>
    </Page>
  );
}

function ActionListItem({
  name,
  readOnly,
  ...props
}: {
  readOnly?: boolean;
  name: string;
}) {
  return (
    <>
      <ListItem
        {...props}
        secondaryAction={
          <>
            {!readOnly && (
              <>
                <IconButton aria-label="edit">
                  <Edit />
                </IconButton>
                <IconButton aria-label="delete">
                  <Delete />
                </IconButton>
              </>
            )}
            <Tooltip title="Add reaction">
              <IconButton edge="end" aria-label="Add reaction">
                <Add />
              </IconButton>
            </Tooltip>
          </>
        }
      >
        <ListItemText primary={name} />
      </ListItem>
      <Box sx={{ ml: 2 }}>
        <List dense sx={{ pt: 0 }}>
          <ReactionListItem />
          <ReactionListItem />
          <ReactionListItem />
        </List>
      </Box>
    </>
  );
}

function ReactionListItem() {
  return (
    <ListItemWithShowActionsOnHover
      secondaryAction={
        <IconButton>
          <More />
        </IconButton>
      }
    >
      <ListItemText primary="Reaction" />
    </ListItemWithShowActionsOnHover>
  );
}

const ListItemWithShowActionsOnHover = styled(ListItem)`
  &:not(:hover) .MuiButtonBase-root {
    display: none;
  }
`;
