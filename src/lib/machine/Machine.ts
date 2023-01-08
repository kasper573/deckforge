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

export interface Machine<MC extends MachineContext> {
  readonly state: MC["state"];
  actions: MC["actions"];
  execute: (fn: (draft: MC["state"]) => void) => void;
  subscribe: (fn: (state: MC["state"]) => void) => () => void;
}

function createMachineInstance<MC extends MachineContext>(
  state: MC["state"],
  effects: MachineEffects<MC>,
  selectReactions?: MachineEffectSelector<MC>,
  middleware?: MachineMiddleware<MC>
): Machine<MC> {
  const subscriptions = new Set<(state: MC["state"]) => void>();

  let currentDraft: MC["state"] | undefined;
  function performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    payload: MachineActionPayload<MC["actions"][ActionName]>
  ) {
    machine.execute((draft) => {
      const handleEffect = effects[name];

      const additionalReaction = handleEffect(draft, payload);
      const reactions = selectReactions?.(draft, name);

      if (reactions) {
        for (const reaction of reactions) {
          reaction(draft, payload);
        }
      }
      if (additionalReaction) {
        additionalReaction(draft, payload);
      }

      middleware?.(draft, { name, payload });
    });
  }

  const machine: Machine<MC> = {
    get state() {
      return state;
    },

    actions: new Proxy({} as MC["actions"], {
      get:
        (target, prop) =>
        <ActionName extends keyof MC["actions"]>(
          payload: MachineActionPayload<MC["actions"][ActionName]>
        ) =>
          performAction(prop as ActionName, payload),
    }),

    execute(fn) {
      if (currentDraft) {
        fn(currentDraft);
        return;
      }

      const previousState = state;

      state = produce(state, (draft: MC["state"]) => {
        currentDraft = draft;
        fn(draft);
        currentDraft = undefined;
      });

      if (previousState !== state) {
        for (const fn of subscriptions) {
          fn(state);
        }
      }
    },

    subscribe(fn) {
      subscriptions.add(fn);
      return () => {
        subscriptions.delete(fn);
      };
    },
  };

  return machine;
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
    return createMachineInstance<
      MachineContext<State, MachineActionsFor<Effects>>
    >(this._state, this._effects, this._reactions, this._middleware);
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
