import produce, { enableMapSet } from "immer";
import type {
  MachineReactionSelector,
  MachineActionInput,
  MachineActionOutput,
  MachineActionRecord,
} from "./MachineAction";
import type { MachineContext } from "./MachineContext";
import type { MachineActionsWithoutContext } from "./MachineAction";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly actions: MachineActionsWithoutContext<MC["actions"]>;
  private subscriptions = new Set<(state: MC["state"]) => void>();

  constructor(
    public state: MC["state"],
    private actionMap: MC["actions"],
    private selectReactions?: MachineReactionSelector<MC>
  ) {
    this.actions = new Proxy(
      {} as MachineActionsWithoutContext<MC["actions"]>,
      {
        get:
          (target, prop) =>
          <ActionName extends keyof MC["actions"]>(
            input: MachineActionInput<MC["actions"][ActionName]>
          ) =>
            this.performAction(prop as ActionName, input),
      }
    );
  }

  performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    input: MachineActionInput<MC["actions"][ActionName]>
  ) {
    let output: MachineActionOutput<MC["actions"][ActionName]>;
    this.execute((draft) => {
      const action = this.actionMap[name] as MC["actions"][ActionName];

      output = action(draft, input);
      const reactions = this.selectReactions?.(this.state, name);

      if (reactions) {
        for (const reaction of reactions) {
          reaction(draft, { output, input });
        }
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return output!;
  }

  private currentDraft?: MC["state"];
  execute(fn: (draft: MC["state"]) => void) {
    if (this.currentDraft) {
      fn(this.currentDraft);
      return;
    }

    const previousState = this.state;

    this.state = produce(this.state, (draft: MC["state"]) => {
      this.currentDraft = draft;
      fn(draft);
      this.currentDraft = undefined;
    });

    if (previousState !== this.state) {
      for (const fn of this.subscriptions) {
        fn(this.state);
      }
    }
  }

  subscribe(fn: (state: MC["state"]) => void) {
    this.subscriptions.add(fn);
    return () => {
      this.subscriptions.delete(fn);
    };
  }
}

export function createMachine<State>(state: State) {
  return new MachineBuilder(state, {}, () => undefined);
}

export function createMachineActions<State>() {
  return <T extends MachineActionRecord<State>>(actions: T) => actions;
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
