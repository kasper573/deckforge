import type {
  ActionId,
  CardId,
  DeckId,
  EntityId,
  ReactionId,
} from "../../../api/services/game/types";
import type { EditorObjectId, EditorState } from "./types";

export const selectors = {
  selectedObject: (state: EditorState) => state.selectedObjectId,
  game: (state: EditorState) => state.game,
  decks: (state: EditorState) => state.game.definition.decks,
  decksAndCards: (state: EditorState) => {
    const { decks, cards } = state.game.definition;
    return decks.map((deck) => ({
      objectId: { type: "deck", deckId: deck.deckId } as EditorObjectId,
      ...deck,
      cards: cards
        .filter((card) => card.deckId === deck.deckId)
        .map((card) => ({
          objectId: { type: "card", cardId: card.cardId } as EditorObjectId,
          ...card,
        })),
    }));
  },
  events: (state: EditorState) => {
    const { actions, reactions } = state.game.definition;
    return actions.map((action) => ({
      objectId: { type: "action", actionId: action.actionId } as EditorObjectId,
      ...action,
      reactions: reactions
        .filter((reaction) => reaction.actionId === action.actionId)
        .map((reaction) => ({
          objectId: {
            type: "reaction",
            reactionId: reaction.reactionId,
          } as EditorObjectId,
          ...reaction,
        })),
    }));
  },
  deck: (deckId: DeckId) => (state: EditorState) =>
    state.game.definition.decks.find((d) => d.deckId === deckId),
  card: (cardId: CardId) => (state: EditorState) =>
    state.game.definition.cards.find((c) => c.cardId === cardId),
  actions: (state: EditorState) => state.game.definition.actions,
  action: (actionId: ActionId) => (state: EditorState) =>
    state.game.definition.actions.find((a) => a.actionId === actionId),
  reaction: (reactionId: ReactionId) => (state: EditorState) =>
    state.game.definition.reactions.find((r) => r.reactionId === reactionId),
  reactionsFor: (actionId: ActionId) => (state: EditorState) =>
    state.game.definition.reactions.filter((r) => r.actionId === actionId),
  propertiesFor: (entityId: EntityId) => (state: EditorState) =>
    state.game.definition.properties.filter((p) => p.entityId === entityId),
  cardsFor: (deckId: DeckId) => (state: EditorState) =>
    state.game.definition.cards.filter((p) => p.deckId === deckId),
};
