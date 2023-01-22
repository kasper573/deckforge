import type { CardInstanceId } from "../../../compiler/types";
import type { VersusTypes } from "../runtimeDefinition";
import { adapter } from "../runtimeDefinition";
import { Card, CardCost } from "./Card";

export function PlayerHand({
  cards,
  player,
  target,
}: {
  player: VersusTypes["player"];
  cards: VersusTypes["cardPile"];
  target: VersusTypes["player"];
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
