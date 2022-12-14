import { styled } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";

export const HoverListItem = styled(ListItem)`
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
    cursor: pointer;
  }
`;
