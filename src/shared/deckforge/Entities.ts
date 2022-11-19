import type { MachineEventHandlerCollection } from "../machine/MachineEvent";
import type { Id } from "./createId";
import type { RuntimeContext } from "./Runtime";

export type EntityCollection<T extends Entity> = Map<T["id"], T>;

export interface Entity<TId extends Id = Id> {
  id: TId;
}

export type PlayerId = Id<"PlayerId">;
export interface Player extends Entity<PlayerId> {
  deck: DeckId;
  health: number;
}

export type CardId = Id<"CardId">;
export interface Card extends Entity<CardId> {
  effects: Effects;
}

export type DeckId = Id<"DeckId">;
export interface Deck extends Entity<DeckId> {
  cards: CardId[];
}

export type BattleId = Id<"BattleId">;
export interface Battle extends Entity<BattleId> {
  member1: BattleMember;
  member2: BattleMember;
  winner?: PlayerId;
}

export interface BattleMember {
  playerId: PlayerId;
  cards: {
    hand: CardId[];
    draw: CardId[];
    discard: CardId[];
  };
}

export type Effects = MachineEventHandlerCollection<RuntimeContext>;
