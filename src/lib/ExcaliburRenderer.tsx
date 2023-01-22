import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import type { Engine } from "excalibur";
import { useElementBounds } from "./useElementBounds";

export interface ExcaliburRendererProps
  extends ComponentProps<typeof Container> {
  engine: (...params: ConstructorParameters<typeof Engine>) => Engine;
}

export default function ExcaliburRenderer({
  engine: createEngine,
  ...props
}: ExcaliburRendererProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bounds = useElementBounds(container ?? undefined);

  useEffect(() => {
    if (!canvasRef.current || !bounds) {
      return;
    }
    const engine = createEngine({
      canvasElement: canvasRef.current,
      width: bounds.width,
      height: bounds.height,
    });

    engine.start();
    return () => engine.stop();
  });

  return (
    <Container ref={setContainer} {...props}>
      <DockedCanvas ref={canvasRef} />
    </Container>
  );
}

const Container = styled("div")`
  position: relative;
  overflow: hidden;
`;

const DockedCanvas = styled("canvas")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
