import { Card } from "./Card";

export function CardPile({ name, size }: { name: string; size: number }) {
  return (
    <Card>
      {name}
      <br />
      {size}
    </Card>
  );
}
