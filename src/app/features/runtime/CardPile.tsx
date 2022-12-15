import type { ComponentProps } from "react";
import { Card } from "./Card";

export function CardPile({
  name,
  size,
  sx,
  onClick,
  ...props
}: { name: string; size: number } & ComponentProps<typeof Card>) {
  return (
    <Card
      sx={{ cursor: onClick ? "pointer" : undefined, ...sx }}
      onClick={onClick}
      {...props}
    >
      {name}
      <br />
      {size}
    </Card>
  );
}
