import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import CardActions from "@mui/material/CardActions";
import type { Game } from "../../../../../api/services/game/types";
import { useModal } from "../../../../../lib/useModal";
import { ConfirmDialog } from "../../../../dialogs/ConfirmDialog";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { useToastProcedure } from "../../../../hooks/useToastProcedure";
import { trpc } from "../../../../trpc";
import { CardLink, LinkMenuItem } from "../../../../components/Link";
import { router } from "../../../../router";
import { MenuFor } from "../../../../components/MenuFor";
import { More } from "../../../../components/icons";
import { describeTime } from "../../../common/describeTime";
import { gameType } from "../../../../../api/services/game/types";

export function GameCard({
  gameId,
  name,
  updatedAt,
}: Pick<Game, "gameId" | "name" | "updatedAt">) {
  const confirm = useModal(ConfirmDialog);
  const prompt = useModal(PromptDialog);
  const updateGame = useToastProcedure(trpc.game.update);
  const deleteGame = useToastProcedure(trpc.game.delete);

  return (
    <CardLink aria-label={name} to={router.editor().edit({ gameId })}>
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
                  <IconButton
                    aria-label="More options"
                    edge="end"
                    onClick={open}
                  >
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
                      label: "New name",
                      defaultValue: name,
                      schema: gameType.shape.name,
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
