import { Sprite, useTick } from "@inlet/react-pixi";
import type { ComponentProps } from "react";
import { useState } from "react";
import type { GameRuntime } from "../../../compiler/compileGame";
import type { VersusGenerics } from "../runtimeDefinition";
import { ResponsiveStage } from "./ResponsiveStage";

export interface PixiGameRendererProps
  extends ComponentProps<typeof ResponsiveStage> {
  runtime: GameRuntime<VersusGenerics>;
}

export function PixiVersusRenderer({
  runtime,
  options,
  ...props
}: PixiGameRendererProps) {
  return (
    <ResponsiveStage options={{ backgroundAlpha: 0, ...options }} {...props}>
      <Image />
    </ResponsiveStage>
  );
}

function Image() {
  useTick((delta) => {
    setRotation((r) => r + (delta / 16 / 10) * Math.PI);
  });
  const [rotation, setRotation] = useState(0);

  return (
    <Sprite
      image="/logo.webp"
      x={100}
      y={100}
      width={100}
      height={100}
      rotation={rotation}
      anchor={[0.5, 0.5]}
    />
  );
}
