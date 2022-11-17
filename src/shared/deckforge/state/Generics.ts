export interface Generics<
  Events extends string = string,
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
}
