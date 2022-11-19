import produce from "immer";
import type { RuntimeContext } from "./state/RuntimeContext";
import type { RuntimeLike } from "./RuntimeLike";
import type { EventInput } from "./state/Event";
import type { EventHandlerSelector } from "./state/EventHandler";

export class Runtime<RC extends RuntimeContext> implements RuntimeLike<RC> {
  events: Readonly<RC["events"]>;

  constructor(
    public state: RC["state"],
    private selectEventHandlers: EventHandlerSelector<RC>
  ) {
    this.events = new Proxy({} as Readonly<RC["events"]>, {
      get:
        (target, prop) =>
        <EventName extends keyof RC["events"]>(input: unknown) =>
          this.triggerEvent(
            prop as EventName,
            input as EventInput<RC["events"][EventName]>
          ),
    });
  }

  private triggerEvent<EventName extends keyof RC["events"]>(
    eventName: EventName,
    eventInput: EventInput<RC["events"][EventName]>
  ) {
    this.state = produce(this.state, (stateDraft: RC["state"]) => {
      for (const handleEvent of this.selectEventHandlers(
        stateDraft,
        eventName
      )) {
        handleEvent(stateDraft, eventInput);
      }
    });
  }
}
