import { immerable } from "immer";
import type { MachineReactionCollection } from "../../../lib/machine/MachineAction";
import type { CardId, DeckId } from "../../../api/services/game/types";
import type { Id } from "./createId";
import type { GameContext } from "./Runtime";
import { createId } from "./createId";

export type EntityCollection<T extends Entity> = Map<T["id"], T>;

export class Entity<TId extends Id = Id> {
  [immerable] = true;
  constructor(public id: TId = createId()) {}
}

export type RuntimePlayerId = Id<"PlayerId">;
export class RuntimePlayer extends Entity<RuntimePlayerId> {
  constructor(public deck: DeckId, public health: number = 0) {
    super();
  }
}

export class RuntimeCard extends Entity<CardId> {
  effects: Effects;
  name: string;

  constructor({
    id,
    name,
    effects = {},
  }: {
    id?: CardId;
    name: string;
    effects?: Effects;
  }) {
    super(id);
    this.name = name;
    this.effects = effects;
  }
}

export class RuntimeDeck extends Entity<DeckId> {
  public cards: CardId[];
  constructor({ id, cards }: { id?: DeckId; cards: Iterable<CardId> }) {
    super(id);
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
      hand: CardId[];
      draw: CardId[];
      discard: CardId[];
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
