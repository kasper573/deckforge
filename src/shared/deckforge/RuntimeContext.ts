import type { EventRecord } from "../machine/Event";

export interface RuntimeContext {
  events: EventRecord;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
}
