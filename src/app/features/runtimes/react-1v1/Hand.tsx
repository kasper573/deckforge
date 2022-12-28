import type { CardId } from "../../../../api/services/game/types";

import { Card } from "./Card";
import type { Builtins } from "./definition";
import { adapter } from "./definition";

export function Hand({
  cards,
  playCardProps,
}: {
  cards: Builtins["cardPile"];
  playCardProps: {
    playerId: Builtins["playerId"];
    targetId: Builtins["playerId"];
  };
}) {
  const actions = adapter.useRuntimeActions();
  const playCard = (cardId: CardId) =>
    actions.playCard({ cardId, ...playCardProps });
  return (
    <>
      {cards.map((card) => (
        <Card key={card.id} onClick={() => playCard(card.id)}>
          {card.name}
        </Card>
      ))}
    </>
  );
}
