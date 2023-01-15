import Backdrop from "@mui/material/Backdrop";
import type { ComponentProps } from "react";
import { styled } from "@mui/material/styles";

export interface ClippedBackdropProps extends ComponentProps<typeof Backdrop> {
  clip?: DOMRect;
}

export function ClippedBackdrop({
  clip,
  style,
  ...props
}: ClippedBackdropProps) {
  const clipPath = clip ? createClipPath(clip) : undefined;
  return <BackdropWithTransition style={{ clipPath, ...style }} {...props} />;
}

const BackdropWithTransition = styled(Backdrop)`
  // !important required because Backdrop has a built-in inline style that always sets transition
  transition: ${({ theme }) => theme.transitions.create("clip-path")},
    ${({ theme }) => theme.transitions.create("opacity")} !important;
`;

function createClipPath(target: DOMRect) {
  const left = p(target.x);
  const top = p(target.y);
  const right = p(target.x + target.width);
  const bottom = p(target.y + target.height);

  const tl = `${left} ${top}`;
  const tr = `${right} ${top}`;
  const br = `${right} ${bottom}`;
  const bl = `${left} ${bottom}`;
  const join = `${left} 100%`;

  return `polygon(0% 0%, 0% 100%, ${join}, ${tl}, ${tr}, ${br}, ${bl}, ${join}, 100% 100%, 100% 0%)`;
}

const p = (v: number) => `${v}px`;
