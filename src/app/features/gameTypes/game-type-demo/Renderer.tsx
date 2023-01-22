import { Color, Engine, Input } from "excalibur";
import type { ComponentProps } from "react";
import type { GameRuntime } from "../../compiler/compileGame";
import ExcaliburRenderer from "../../../../lib/ExcaliburRenderer";
import type { DemoGenerics } from "./runtimeDefinition";

export interface RendererProps
  extends Omit<ComponentProps<typeof ExcaliburRenderer>, "engine"> {
  runtime: GameRuntime<DemoGenerics>;
}

export default function Renderer({ runtime, ...props }: RendererProps) {
  return <ExcaliburRenderer engine={createGame} {...props} />;
}

function createGame(...[engineProps]: ConstructorParameters<typeof Engine>) {
  return new Engine({
    ...engineProps,
    backgroundColor: Color.Transparent,
    pointerScope: Input.PointerScope.Canvas,
  });
}
