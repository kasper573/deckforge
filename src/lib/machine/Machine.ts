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
import type { MachinePayloadFilter } from "./MachineAction";

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
  middlewares: MachineMiddleware<MC>[] = [],
  payloadFilter: MachinePayloadFilter<MC> = (name, payload) => payload
): Machine<MC> {
  const subscriptions = new Set<(state: MC["state"]) => void>();
  const effectHandler = createEffectHandlerMiddleware(effects, selectReactions);

  let currentDraft: MC["state"] | undefined;
  function performAction<ActionName extends keyof MC["actions"]>(
    name: ActionName,
    payload: MachineActionPayload<MC["actions"][ActionName]>
  ) {
    payload = payloadFilter(name, payload);
    machine.execute((draft) => {
      const middlewareQueue = [...middlewares, effectHandler];

      function callNextMiddleware() {
        const nextMiddleware = middlewareQueue.shift();
        if (nextMiddleware) {
          nextMiddleware(draft, { name, payload }, callNextMiddleware);
        }
      }

      callNextMiddleware();
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

function createEffectHandlerMiddleware<MC extends MachineContext>(
  effects: MachineEffects<MC>,
  selectReactions?: MachineEffectSelector<MC>
): MachineMiddleware<MC> {
  return (draft, { name, payload }, next) => {
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

    next();
  };
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
    private _middlewares: Array<
      MachineMiddleware<MachineContext<State, MachineActionsFor<Effects>>>
    > = [],
    private _payloadFilter?: MachinePayloadFilter<
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
    this._reactions = newReactions;
    return this;
  }

  middleware(
    middleware: MachineMiddleware<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {
    this._middlewares = [...this._middlewares, middleware];
    return this;
  }

  payloadFilter(
    filter: MachinePayloadFilter<
      MachineContext<State, MachineActionsFor<Effects>>
    >
  ) {
    this._payloadFilter = filter;
    return this;
  }

  build() {
    return createMachineInstance<
      MachineContext<State, MachineActionsFor<Effects>>
    >(
      this._state,
      this._effects,
      this._reactions,
      this._middlewares,
      this._payloadFilter
    );
  }
}
