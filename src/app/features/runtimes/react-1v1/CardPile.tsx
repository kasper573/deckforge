import type { ComponentProps } from "react";
import { Card } from "./Card";

export function CardPile({
  name,
  size,
  ...props
}: { name: string; size: number } & ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      {name}
      <br />
      {size}
    </Card>
  );
}
