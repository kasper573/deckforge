import produce from "immer";
import type { EventHandlerSelector, EventInput, EventRecord } from "./Event";

export class Machine<State, Events extends EventRecord> {
  readonly events: Events;

  constructor(
    public state: State,
    private selectEventHandlers: EventHandlerSelector<State, Events>
  ) {
    this.events = new Proxy({} as Events, {
      get:
        (target, prop) =>
        <EventName extends keyof Events>(
          input: EventInput<Events[EventName]>
        ) =>
          this.triggerEvent(prop as EventName, input),
    });
  }

  private triggerEvent<EventName extends keyof Events>(
    eventName: EventName,
    eventInput: EventInput<Events[EventName]>
  ) {
    this.state = produce(this.state, (draft: State) => {
      for (const handleEvent of this.selectEventHandlers(draft, eventName)) {
        handleEvent(draft, eventInput);
      }
    });
  }
}
