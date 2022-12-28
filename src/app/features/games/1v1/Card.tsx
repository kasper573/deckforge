import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";

export function Card({ sx, onClick, ...props }: ComponentProps<typeof Root>) {
  return (
    <Root
      sx={{ cursor: onClick ? "pointer" : undefined, ...sx }}
      onClick={onClick}
      {...props}
    />
  );
}

const Root = styled("div")`
  background: white;
  border-radius: 4px;
  aspect-ratio: 1 / 1.5;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  color: black;
  text-align: center;
`;
