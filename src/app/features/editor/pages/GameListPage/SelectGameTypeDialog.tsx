import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import type { GameTypeId } from "../../../../../api/services/game/types";
import type { ModalProps } from "../../../../../lib/useModal";
import { gameTypeList } from "../../../gameTypes";

export type SelectGameTypeDialogProps = ModalProps<GameTypeId | undefined>;

export function SelectGameTypeDialog({
  open,
  resolve,
}: SelectGameTypeDialogProps) {
  return (
    <Dialog
      disableRestoreFocus
      fullWidth
      open={open}
      onClose={() => resolve(undefined)}
    >
      <DialogTitle>Select game type</DialogTitle>
      <DialogContent>
        <GameTypeList direction="row" spacing={3}>
          {gameTypeList.map(({ id, name, description }) => (
            <GameTypeCard key={id} onClick={() => resolve(id)}>
              <CardContent>
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body2">{description}</Typography>
              </CardContent>
            </GameTypeCard>
          ))}
        </GameTypeList>
      </DialogContent>
    </Dialog>
  );
}

const GameTypeList = styled(Stack)``;

const GameTypeCard = styled(Card)`
  width: 300px;
  cursor: pointer;
`;
