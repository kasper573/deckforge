import type { EventRecord } from "./Event";

export interface Generics<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Events extends EventRecord = any,
  Settings = unknown,
  PlayerProps = unknown,
  ItemProps = unknown,
  CardProps = unknown,
  DeckProps = unknown,
  IndividualCardPiles extends string = string,
  SharedCardPiles extends string = string
> {
  events: Events;
  settings: Settings;
  playerProps: PlayerProps;
  itemProps: ItemProps;
  cardProps: CardProps;
  deckProps: DeckProps;
  individualCardPiles: IndividualCardPiles;
  sharedCardPiles: SharedCardPiles;
}
