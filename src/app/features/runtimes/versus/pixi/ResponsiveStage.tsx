import type { ComponentProps } from "react";
import { useState } from "react";
import { Stage } from "@inlet/react-pixi";
import { useElementBounds } from "../../../../../lib/useElementBounds";

export function ResponsiveStage({
  className,
  style,
  ...stageProps
}: ComponentProps<typeof Stage>) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const { width, height } = useElementBounds(element ?? undefined) ?? {};
  return (
    <div
      ref={setElement}
      className={className}
      style={{ ...containerStyle, ...style }}
    >
      <Stage
        renderOnComponentChange
        style={dockStyle}
        width={width}
        height={height}
        {...stageProps}
      />
    </div>
  );
}

const containerStyle = { position: "relative", overflow: "hidden" } as const;
const dockStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;
