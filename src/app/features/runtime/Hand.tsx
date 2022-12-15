import type { CardId } from "../../../api/services/game/types";
import { defined } from "../../../lib/ts-extensions/defined";
import { Card } from "./Card";
import { useRuntimeState } from "./ReactRuntimeAdapter";

export function Hand({ cards: cardIds }: { cards: CardId[] }) {
  const cards = useRuntimeState((state) =>
    defined(cardIds.map((id) => state.cards.get(id)))
  );
  return (
    <>
      {cards.map((card) => (
        <Card key={card.id}>{card.name}</Card>
      ))}
    </>
  );
}
