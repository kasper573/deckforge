import { Card } from "./Card";

export function DiscardPile({ size }: { size: number }) {
  return (
    <Card>
      Discard
      <br />
      {size}
    </Card>
  );
}
