import type { CardInstanceId } from "../../../compiler/types";
import type { React1v1Types } from "./definition";
import { adapter } from "./definition";
import { Card, CardCost } from "./Card";

export function PlayerHand({
  cards,
  player,
  target,
}: {
  player: React1v1Types["player"];
  cards: React1v1Types["cardPile"];
  target: React1v1Types["player"];
}) {
  const actions = adapter.useRuntimeActions();
  const playCard = (cardId: CardInstanceId) =>
    actions.playCard({ cardId, playerId: player.id, targetId: target.id });
  return (
    <>
      {cards.map((card) => (
        <Card
          key={card.id}
          onClick={() => playCard(card.id)}
          disabled={card.properties.manaCost > player.properties.mana}
        >
          {card.name}
          <CardCost>{card.properties.manaCost}</CardCost>
        </Card>
      ))}
    </>
  );
}
