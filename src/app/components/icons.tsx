import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Play from "@mui/icons-material/PlayArrow";
import Add from "@mui/icons-material/Add";
import More from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/icons-material/Menu";
import MuiExitToApp from "@mui/icons-material/ExitToApp";
import Close from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import KeyboardReturn from "@mui/icons-material/KeyboardReturn";
import KeyboardTab from "@mui/icons-material/KeyboardTab";

export { Delete, Edit, Play, Add, More, Menu, Close };

export const Action = KeyboardTab;

export const Reaction = KeyboardReturn;

export const ExitToApp = styled(MuiExitToApp)`
  transform: rotate(180deg);
`;
