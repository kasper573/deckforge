import produce, { enableMapSet } from "immer";
import type {
  MachineReactionSelector,
  MachineActionInput,
  MachineActionOutput,
  MachineActionRecord,
} from "./MachineAction";
import type { MachineContext } from "./MachineContext";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly actions: ActionProxy<MC["actions"]>;

  constructor(
    public state: MC["state"],
    private actionMap: MC["actions"],
    private selectReactions?: MachineReactionSelector<MC>
  ) {
    this.actions = new Proxy({} as ActionProxy<MC["actions"]>, {
      get:
        (target, prop) =>
        <ActionName extends keyof MC["actions"]>(
          ...input: MachineActionInput<MC["actions"][ActionName]>
        ) =>
          this.performAction(prop as ActionName, input),
    });
  }

  private performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    input: MachineActionInput<MC["actions"][ActionName]>
  ) {
    let output: MachineActionOutput<MC["actions"][ActionName]>;
    this.state = produce(this.state, (draft: MC["state"]) => {
      const action = this.actionMap[name] as MC["actions"][ActionName];
      output = action(draft, ...input);
      const reactions = this.selectReactions?.(this.state, name) ?? [];
      for (const reaction of reactions) {
        reaction(draft, output, ...input);
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return output!;
  }
}

type ActionProxy<Actions extends MachineActionRecord> = {
  [Name in keyof Actions]: (
    ...input: MachineActionInput<Actions[Name]>
  ) => MachineActionOutput<Actions[Name]>;
};

export function createMachine<State>(state: State) {
  return new MachineBuilder(state, {}, () => undefined);
}

class MachineBuilder<State, Actions extends MachineActionRecord> {
  constructor(
    private _state: State,
    private _actions: Actions,
    private _reactions: MachineReactionSelector<MachineContext<State, Actions>>
  ) {}

  actions<Actions extends MachineActionRecord<State>>(newActions: Actions) {
    return new MachineBuilder<State, Actions>(
      this._state,
      newActions,
      () => undefined
    );
  }

  reactions(
    newReactions: MachineReactionSelector<MachineContext<State, Actions>>
  ) {
    return new MachineBuilder<State, Actions>(
      this._state,
      this._actions,
      newReactions
    );
  }

  build() {
    return new Machine<MachineContext<State, Actions>>(
      this._state,
      this._actions,
      this._reactions
    );
  }
}
