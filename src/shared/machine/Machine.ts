import produce from "immer";
import type {
  MachineEventHandlerSelector,
  MachineEventInput,
} from "./MachineEvent";
import type { MachineContext } from "./MachineContext";

export class Machine<MC extends MachineContext> {
  readonly events: MC["events"];

  constructor(
    public state: MC["state"],
    private selectEventHandlers: MachineEventHandlerSelector<MC>
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
    this.state = produce(this.state, (draft: MC["state"]) => {
      for (const handleEvent of this.selectEventHandlers(draft, eventName)) {
        handleEvent(draft, eventInput);
      }
    });
  }
}
