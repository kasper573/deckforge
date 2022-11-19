import type { EventRecord } from "./Event";

export interface RuntimeContext {
  events: EventRecord;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  battleProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playerProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardProps: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deckProps: any;
  playerCardPiles: string;
  battleCardPiles: string;
}
