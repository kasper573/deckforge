import type { RuntimePlayerId } from "../../compiler/types";
import type { CardInstanceId } from "../../compiler/types";
import { Card } from "./Card";
import type { React1v1Types } from "./definition";
import { adapter } from "./definition";

export function Hand({
  cards,
  playCardProps,
}: {
  cards: React1v1Types["card"][];
  playCardProps: {
    playerId: RuntimePlayerId;
    targetId: RuntimePlayerId;
  };
}) {
  const actions = adapter.useRuntimeActions();
  const playCard = (cardId: CardInstanceId) =>
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
