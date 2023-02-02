import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { LoadingIndicator } from "../../../../components/LoadingIndicator";

export function CompilingIndicator({ visible }: { visible?: boolean }) {
  return (
    <Fade in={visible}>
      <Container direction="row" spacing={1} alignItems="center">
        <Typography>Compiling</Typography>
        <LoadingIndicator size={24} />
      </Container>
    </Fade>
  );
}

const Container = styled(Stack)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  background: rgba(0, 0, 0, 0.66);
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
