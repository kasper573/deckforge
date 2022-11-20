import produce, { enableMapSet } from "immer";
import type {
  MachineReactionSelector,
  MachineActionInput,
} from "./MachineAction";
import type { MachineContext } from "./MachineContext";
import type { MachineReactionMap } from "./MachineAction";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly actions: MC["actions"];

  constructor(
    public state: MC["state"],
    private globalReactions?: MachineReactionMap<MC>,
    private selectReactions?: MachineReactionSelector<MC>
  ) {
    this.actions = new Proxy({} as MC["actions"], {
      get:
        (target, prop) =>
        <ActionName extends keyof MC["actions"]>(
          input: MachineActionInput<MC["actions"][ActionName]>
        ) =>
          this.performAction(prop as ActionName, input),
    });
  }

  private performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    input: MachineActionInput<MC["actions"][ActionName]>
  ) {
    const globalReaction = this.globalReactions?.[name];
    const actionsAndReactions = [
      ...(globalReaction ? [globalReaction] : []),
      ...(this.selectReactions?.(this.state, name) ?? []),
    ];
    this.state = produce(this.state, (draft: MC["state"]) => {
      for (const action of actionsAndReactions) {
        action(draft, input);
      }
    });
  }
}
