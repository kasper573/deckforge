import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import CardActions from "@mui/material/CardActions";
import { PromptDialog } from "../../../dialogs/PromptDialog";
import { useModal } from "../../../../lib/useModal";
import { router } from "../../../router";
import { CardLink, LinkMenuItem } from "../../../components/Link";
import { Page } from "../../layout/Page";
import { More } from "../../../components/icons";
import { trpc } from "../../../trpc";
import { ConfirmDialog } from "../../../dialogs/ConfirmDialog";
import { useToastProcedure } from "../../../hooks/useToastProcedure";
import type { Game } from "../../../../api/services/game/types";
import { Header } from "../../layout/Header";
import { Center } from "../../../components/Center";
import { MenuFor } from "../../../components/MenuFor";
import { LoadingPage } from "../../common/LoadingPage";
import { describeTime } from "../../common/describeTime";

export default function GameListPage() {
  const history = useHistory();
  const games = trpc.game.list.useQuery({ offset: 0, limit: 10 });
  const createGame = useToastProcedure(trpc.game.create);
  const prompt = useModal(PromptDialog);

  async function enterNameAndCreateGame() {
    const name = await prompt({
      title: "Create new game",
      fieldProps: { label: "Game name" },
    });
    if (!name) {
      return;
    }
    try {
      const { gameId } = await createGame.mutateAsync({ name, definition: {} });
      history.push(router.build().game({ gameId }).$);
    } catch {}
  }

  // Creating a game will turn on the loading state indefinitely
  // Once mutation is done, we'll redirect to the game page
  if (createGame.isSuccess || createGame.isLoading) {
    return <LoadingPage />;
  }

  return (
    <Page>
      <Header>Your games</Header>

      <CardGrid>
        <Card sx={{ position: "relative" }}>
          <Center>
            <Button
              variant="contained"
              sx={{ whiteSpace: "nowrap" }}
              onClick={enterNameAndCreateGame}
            >
              Create new game
            </Button>
          </Center>
        </Card>
        {games.data?.entities.map((game) => (
          <GameListCard key={game.gameId} {...game} />
        ))}
        {games.data?.total === 0 && (
          <Typography align="center">
            {"You haven't created any games yet."}
          </Typography>
        )}
      </CardGrid>
    </Page>
  );
}

function GameListCard({
  gameId,
  name,
  updatedAt,
}: Pick<Game, "gameId" | "name" | "updatedAt">) {
  const confirm = useModal(ConfirmDialog);
  const prompt = useModal(PromptDialog);
  const updateGame = useToastProcedure(trpc.game.update);
  const deleteGame = useToastProcedure(trpc.game.delete);

  return (
    <CardLink to={router.build().game({ gameId })}>
      <CardActionArea component="div">
        <CardMedia component="img" height="140" image="/logo.webp" />
        <CardContent>
          <Stack direction="row" justifyContent="space-between">
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              sx={{ textDecoration: "strikethrough" }}
            >
              {name}
            </Typography>
            <div>
              <MenuFor
                trigger={({ open }) => (
                  <IconButton edge="end" onClick={open}>
                    <More />
                  </IconButton>
                )}
              >
                <LinkMenuItem to={router.play().game({ gameId })}>
                  Play
                </LinkMenuItem>
                <MenuItem
                  onClick={() =>
                    prompt({
                      title: "Rename game",
                      fieldProps: { label: "New name", defaultValue: name },
                    }).then(
                      (name) => name && updateGame.mutate({ gameId, name })
                    )
                  }
                >
                  Rename
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    confirm({
                      title: "Delete game",
                      content: `Are you sure you want to delete "${name}". This action cannot be reversed.`,
                    }).then(
                      (confirmed) => confirmed && deleteGame.mutate(gameId)
                    )
                  }
                >
                  Delete
                </MenuItem>
              </MenuFor>
            </div>
          </Stack>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          Last changed {describeTime(updatedAt)}
        </CardActions>
      </CardActionArea>
    </CardLink>
  );
}

const CardGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  grid-gap: 1rem;
`;
