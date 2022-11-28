import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Delete, Edit, Play } from "../components/icons";
import { Header } from "../components/Header";
import { Page } from "../layout/Page";
import { LinkIconButton } from "../components/Link";
import { router } from "../router";

export default function BuildPage() {
  const [games] = useState<string[]>([]);
  return (
    <Page>
      <Header>BuildPage</Header>
      <Paper sx={{ mb: 3 }}>
        <List dense aria-label="Games">
          {games.map((gameId) => (
            <GameListItem key={gameId} gameId={gameId} />
          ))}
          {games.length === 0 && (
            <Typography align="center">
              {"You haven't created any games yet."}
            </Typography>
          )}
        </List>
      </Paper>
      <Button variant="contained">Create new game</Button>
    </Page>
  );
}

function GameListItem({ gameId }: { gameId: string }) {
  return (
    <ListItem
      secondaryAction={
        <>
          <LinkIconButton to={router.play().game({ gameId })} aria-label="play">
            <Play />
          </LinkIconButton>
          <LinkIconButton
            to={router.build().game({ gameId })}
            aria-label="edit"
          >
            <Edit />
          </LinkIconButton>
          <IconButton edge="end" aria-label="delete">
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary={gameId} />
    </ListItem>
  );
}
