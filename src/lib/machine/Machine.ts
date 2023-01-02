import produce, { enableMapSet } from "immer";
import type {
  MachineActionPayload,
  MachineEffects,
  MachineActionsFor,
} from "./MachineAction";
import type { MachineContext } from "./MachineContext";
import type { MachineEffectSelector } from "./MachineAction";
import type { AnyMachineEffects } from "./MachineAction";
import type { MachineMiddleware } from "./MachineAction";

enableMapSet();

export class Machine<MC extends MachineContext> {
  readonly actions: MC["actions"];
  private subscriptions = new Set<(state: MC["state"]) => void>();

  constructor(
    public state: MC["state"],
    private effects: MachineEffects<MC>,
    private selectReactions?: MachineEffectSelector<MC>,
    private middleware?: MachineMiddleware<MC>
  ) {
    this.actions = new Proxy({} as MC["actions"], {
      get:
        (target, prop) =>
        <ActionName extends keyof MC["actions"]>(
          payload: MachineActionPayload<MC["actions"][ActionName]>
        ) =>
          this.performAction(prop as ActionName, payload),
    });
  }

  private performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    payload: MachineActionPayload<MC["actions"][ActionName]>
  ) {
    this.execute((draft) => {
      const handleEffect = this.effects[name];

      const additionalReaction = handleEffect(draft, payload);
      const reactions = this.selectReactions?.(this.state, name);

      if (reactions) {
        for (const reaction of reactions) {
          reaction(draft, payload);
        }
      }
      if (additionalReaction) {
        additionalReaction(draft, payload);
      }

      this.middleware?.(draft, { name, payload });
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
    private _reactions?: MachineEffectSelector<
      MachineContext<State, MachineActionsFor<Effects>>
    >,
    private _middleware?: MachineMiddleware<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {}

  effects<Effects extends AnyMachineEffects<State>>(newEffects: Effects) {
    return new MachineBuilder<State, Effects>(this._state, newEffects);
  }

  reactions(
    newReactions: MachineEffectSelector<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {
    return new MachineBuilder<State, Effects>(
      this._state,
      this._effects,
      newReactions,
      this._middleware
    );
  }

  middleware(
    middleware: MachineMiddleware<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {
    return new MachineBuilder<State, Effects>(
      this._state,
      this._effects,
      this._reactions,
      combineMiddlewares(this._middleware, middleware)
    );
  }

  build() {
    return new Machine<MachineContext<State, MachineActionsFor<Effects>>>(
      this._state,
      this._effects,
      this._reactions,
      this._middleware
    );
  }
}

function combineMiddlewares<MC extends MachineContext>(
  a: MachineMiddleware<MC> | undefined,
  b: MachineMiddleware<MC> | undefined
): MachineMiddleware<MC> | undefined {
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }
  return (...args) => {
    a(...args);
    b(...args);
  };
}
