import { immerable } from "immer";
import type { MachineReactionCollection } from "../../../lib/machine/MachineAction";
import type { Id } from "./createId";
import type { GameContext } from "./Game";
import { createId } from "./createId";

export type EntityCollection<T extends Entity> = Map<T["id"], T>;

export class Entity<TId extends Id = Id> {
  [immerable] = true;
  id: TId = createId();
}

export type RuntimePlayerId = Id<"PlayerId">;
export class RuntimePlayer extends Entity<RuntimePlayerId> {
  constructor(public deck: RuntimeDeckId, public health: number = 0) {
    super();
  }
}

export type RuntimeCardId = Id<"CardId">;
export class RuntimeCard extends Entity<RuntimeCardId> {
  constructor(public name: string, public effects: Effects) {
    super();
  }
}

export type RuntimeDeckId = Id<"DeckId">;
export class RuntimeDeck extends Entity<RuntimeDeckId> {
  public cards: RuntimeCardId[];
  constructor(cards: Iterable<RuntimeCardId>) {
    super();
    this.cards = Array.from(cards);
  }
}

export type RuntimeBattleId = Id<"BattleId">;
export class RuntimeBattle extends Entity<RuntimeBattleId> {
  constructor(
    public member1: RuntimeBattleMember,
    public member2: RuntimeBattleMember,
    public winner?: RuntimePlayerId
  ) {
    super();
  }

  selectMember(playerId: RuntimePlayerId): RuntimeBattleMember {
    const member = [this.member1, this.member2].find(
      (member) => member.playerId === playerId
    );
    if (!member) {
      throw new Error(`Player ${playerId} not in battle ${this.id}`);
    }
    return member;
  }
}

export class RuntimeBattleMember {
  [immerable] = true;
  constructor(
    public playerId: RuntimePlayerId,
    public cards: {
      hand: RuntimeCardId[];
      draw: RuntimeCardId[];
      discard: RuntimeCardId[];
    }
  ) {}

  static from(playerId: RuntimePlayerId, deck: RuntimeDeck) {
    return new RuntimeBattleMember(playerId, {
      hand: [],
      draw: [...deck.cards],
      discard: [],
    });
  }
}

export type Effects = MachineReactionCollection<GameContext>;
