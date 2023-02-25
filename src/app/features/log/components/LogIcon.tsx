import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";

export function LogIcon({ children, ...rest }: ComponentProps<typeof Root>) {
  return (
    <Root {...rest}>
      <Inner>{children}</Inner>
    </Root>
  );
}

export const Root = styled("div")`
  display: inline-flex;
  height: 17px;
  width: 30px;
  align-content: center;
  align-items: center;
  position: relative;
`;

const Inner = styled("div")`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 17px;
`;
