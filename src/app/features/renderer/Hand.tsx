import type { CardId } from "../../../api/services/game/types";
import { defined } from "../../../lib/ts-extensions/defined";
import { useRuntimeState } from "../runtime/ReactRuntimeAdapter";
import { Card } from "./Card";

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
