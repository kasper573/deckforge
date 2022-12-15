import type { CardId } from "../../../api/services/game/types";
import { defined } from "../../../lib/ts-extensions/defined";
import {
  useRuntimeActions,
  useRuntimeState,
} from "../runtime/ReactRuntimeAdapter";
import type { CardPayload } from "../runtime/Runtime";
import type { RuntimePlayerId } from "../runtime/Entities";
import { Card } from "./Card";

export function Hand({
  cards: cardIds,
  playCardProps,
}: {
  cards: CardId[];
  playCardProps: Omit<CardPayload, "cardId"> & { targetId: RuntimePlayerId };
}) {
  const actions = useRuntimeActions();
  const cards = useRuntimeState((state) =>
    defined(cardIds.map((id) => state.cards.get(id)))
  );
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
