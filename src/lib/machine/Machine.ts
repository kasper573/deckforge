import produce, { enableMapSet } from "immer";
import type {
  MachinePayload,
  MachineEffects,
  MachineActionsFor,
} from "./MachineAction";
import type { MachineContext } from "./MachineContext";
import type { MachineEffectSelector } from "./MachineAction";
import type { AnyMachineEffects } from "./MachineAction";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly actions: MC["actions"];
  private subscriptions = new Set<(state: MC["state"]) => void>();

  constructor(
    public state: MC["state"],
    private effects: MachineEffects<MC>,
    private selectReactions?: MachineEffectSelector<MC>
  ) {
    this.actions = new Proxy({} as MC["actions"], {
      get:
        (target, prop) =>
        <ActionName extends keyof MC["actions"]>(
          payload: MachinePayload<MC["actions"][ActionName]>
        ) =>
          this.performAction(prop as ActionName, payload),
    });
  }

  private performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    payload: MachinePayload<MC["actions"][ActionName]>
  ) {
    this.execute((draft) => {
      const handleEffect = this.effects[name];

      handleEffect(draft, payload);
      const reactions = this.selectReactions?.(this.state, name);

      if (reactions) {
        for (const reaction of reactions) {
          reaction(draft, payload);
        }
      }
    });
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

class MachineBuilder<State, Effects extends AnyMachineEffects<State>> {
  constructor(
    private _state: State,
    private _effects: Effects,
    private _reactions: MachineEffectSelector<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {}

  effects<Effects extends AnyMachineEffects<State>>(newEffects: Effects) {
    return new MachineBuilder<State, Effects>(
      this._state,
      newEffects,
      () => undefined
    );
  }

  reactions(
    newReactions: MachineEffectSelector<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {
    return new MachineBuilder<State, Effects>(
      this._state,
      this._effects,
      newReactions
    );
  }

  build() {
    return new Machine<MachineContext<State, MachineActionsFor<Effects>>>(
      this._state,
      this._effects,
      this._reactions
    );
  }
}
