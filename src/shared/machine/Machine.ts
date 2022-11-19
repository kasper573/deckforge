import produce from "immer";
import type {
  MachineEventHandlerSelector,
  MachineEventInput,
} from "./MachineEvent";
import type { MachineContext } from "./MachineContext";
import type { MachineEventHandlerCollection } from "./MachineEvent";

export class Machine<MC extends MachineContext> {
  readonly events: MC["events"];

  constructor(
    public state: MC["state"],
    private globalEventHandlers?: MachineEventHandlerCollection<MC>,
    private selectEventHandlers?: MachineEventHandlerSelector<MC>
  ) {
    this.events = new Proxy({} as MC["events"], {
      get:
        (target, prop) =>
        <EventName extends keyof MC["events"]>(
          input: MachineEventInput<MC["events"][EventName]>
        ) =>
          this.triggerEvent(prop as EventName, input),
    });
  }

  private triggerEvent<EventName extends keyof MC["events"]>(
    eventName: EventName,
    eventInput: MachineEventInput<MC["events"][EventName]>
  ) {
    const eventHandlers = [
      ...(this.globalEventHandlers?.[eventName] ?? []),
      ...(this.selectEventHandlers?.(this.state, eventName) ?? []),
    ];
    this.state = produce(this.state, (draft: MC["state"]) => {
      for (const handleEvent of eventHandlers) {
        handleEvent(draft, eventInput);
      }
    });
  }
}
