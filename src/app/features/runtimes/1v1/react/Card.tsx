import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import type { MakePartial } from "../../../../../lib/ts-extensions/MakePartial";

export type CardProps = MakePartial<ComponentProps<typeof Card>, "disabled">;

export const Card = styled("div", {
  shouldForwardProp(propName: PropertyKey) {
    return propName !== "disabled";
  },
})<{ disabled?: boolean }>`
  background: white;
  border-radius: 4px;
  aspect-ratio: 1 / 1.5;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  color: black;
  text-align: center;
  position: relative;
  cursor: ${(props) => (props.onClick ? "pointer" : undefined)};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

export const CardCost = styled("div")`
  position: absolute;
  top: 0;
  right: 0;
  background: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  transform: translate(50%, -50%);
`;
