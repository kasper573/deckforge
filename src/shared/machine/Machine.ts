import produce, { enableMapSet } from "immer";
import type {
  MachineEventHandlerSelector,
  MachineEventInput,
} from "./MachineEvent";
import type { MachineContext } from "./MachineContext";
import type { MachineEventHandlerMap } from "./MachineEvent";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly events: MC["events"];

  constructor(
    public state: MC["state"],
    private globalEventHandlers?: MachineEventHandlerMap<MC>,
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
    const globalEventHandler = this.globalEventHandlers?.[eventName];
    const eventHandlers = [
      ...(globalEventHandler ? [globalEventHandler] : []),
      ...(this.selectEventHandlers?.(this.state, eventName) ?? []),
    ];
    this.state = produce(this.state, (draft: MC["state"]) => {
      for (const handleEvent of eventHandlers) {
        handleEvent(draft, eventInput);
      }
    });
  }
}
