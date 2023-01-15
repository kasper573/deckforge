import Backdrop from "@mui/material/Backdrop";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import { useObjectUrl } from "../../lib/useObjectUrl";

export interface ClippedBackdropProps extends ComponentProps<typeof Backdrop> {
  clip?: DOMRect;
}

export function ClippedBackdrop({
  clip,
  style,
  ...props
}: ClippedBackdropProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const bounds = useMemo(() => element?.getBoundingClientRect(), [element]);
  const clipPathSvg = useMemo(
    () => bounds && clip && createClipPathSVG(bounds, clip),
    [bounds, clip]
  );
  const clipUrl = useObjectUrl(clipPathSvg);
  return (
    <>
      <BackdropWithTransition
        ref={setElement}
        style={{
          clipPath: clipUrl ? `url(${clipUrl}#${pathId})` : undefined,
          ...style,
        }}
        {...props}
      />
    </>
  );
}

const pathId = "my-clip-path";

const BackdropWithTransition = styled(Backdrop)`
  // !important required because Backdrop has a built-in inline style that always sets transition
  transition: ${({ theme }) => theme.transitions.create("clip-path")},
    ${({ theme }) => theme.transitions.create("opacity")} !important;
`;

function createClipPathSVG(
  { width, height }: { width: number; height: number },
  target: DOMRect
) {
  const left = target.x;
  const top = target.y;
  const right = target.x + target.width;
  const bottom = target.y + target.height;

  const r1 = { x: 0, y: 0, width, height: top };
  const r2 = { x: 0, y: top, width: left, height };
  const r3 = { x: right, y: top, width: width - right, height: height - top };
  const r4 = {
    x: left,
    y: bottom,
    width: target.width,
    height: height - bottom,
  };

  const rectStrings = [r1, r2, r3, r4].map(
    (r) =>
      `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" />`
  );

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <clipPath id="${pathId}">
        ${rectStrings.join("\n")}
      </clipPath>
    </svg>
  `;

  return new Blob([svgString], { type: "image/svg+xml" });
}
