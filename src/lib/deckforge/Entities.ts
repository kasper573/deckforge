import { immerable } from "immer";
import type { MachineReactionCollection } from "../machine/MachineAction";
import type { Id } from "./createId";
import type { GameContext } from "./Game";
import { createId } from "./createId";

export type EntityCollection<T extends Entity> = Map<T["id"], T>;

export class Entity<TId extends Id = Id> {
  [immerable] = true;
  id: TId = createId();
}

export type PlayerId = Id<"PlayerId">;
export class Player extends Entity<PlayerId> {
  constructor(public deck: DeckId, public health: number = 0) {
    super();
  }
}

export type CardId = Id<"CardId">;
export class Card extends Entity<CardId> {
  constructor(public effects: Effects) {
    super();
  }
}

export type DeckId = Id<"DeckId">;
export class Deck extends Entity<DeckId> {
  public cards: CardId[];
  constructor(cards: Iterable<CardId>) {
    super();
    this.cards = Array.from(cards);
  }
}

export type BattleId = Id<"BattleId">;
export class Battle extends Entity<BattleId> {
  constructor(
    public member1: BattleMember,
    public member2: BattleMember,
    public winner?: PlayerId
  ) {
    super();
  }

  selectMember(playerId: PlayerId): BattleMember {
    const member = [this.member1, this.member2].find(
      (member) => member.playerId === playerId
    );
    if (!member) {
      throw new Error(`Player ${playerId} not in battle ${this.id}`);
    }
    return member;
  }
}

export class BattleMember {
  constructor(
    public playerId: PlayerId,
    public cards: {
      hand: CardId[];
      draw: CardId[];
      discard: CardId[];
    }
  ) {}

  static from(playerId: PlayerId, deck: Deck) {
    return new BattleMember(playerId, {
      hand: [],
      draw: [...deck.cards],
      discard: [],
    });
  }
}

export type Effects = MachineReactionCollection<GameContext>;
