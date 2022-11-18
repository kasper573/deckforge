import type { EventRecord } from "./Event";

export interface Generics<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Events extends EventRecord = any,
  Settings = unknown,
  PlayerResources extends string = string,
  ItemTypes extends string = string,
  CardTypes extends string = string,
  IndividualCardPiles extends string = string,
  SharedCardPiles extends string = string
> {
  events: Events;
  playerResources: PlayerResources;
  itemTypes: ItemTypes;
  cardTypes: CardTypes;
  individualCardPiles: IndividualCardPiles;
  sharedCardPiles: SharedCardPiles;
  settings: Settings;
}
