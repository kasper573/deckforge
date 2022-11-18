import type { DeepReadonly } from "ts-essentials";
import produce from "immer";
import type { Generics } from "./state/Generics";
import type { Rules } from "./state/Rules";
import type { RuntimeState } from "./state/RuntimeState";
import type { RuntimeLike, RuntimeEventEmitters } from "./RuntimeLike";

export class Runtime<G extends Generics> implements RuntimeLike<G> {
  readonly events: RuntimeEventEmitters<G["events"]>;

  private _state: RuntimeState<G>;
  get state() {
    return this._state as unknown as DeepReadonly<RuntimeState<G>>;
  }

  constructor(rules: Rules<G>, initialState: RuntimeState<G>) {
    this._state = initialState;
    this.events = new Proxy({} as RuntimeEventEmitters<G["events"]>, {
      get: (target, prop) => () => this.triggerEvent(prop as G["events"]),
    });
  }

  private triggerEvent<Event extends G["events"]>(eventName: Event) {
    this._state = produce(this._state, (draft) =>
      processEventAndMutateStateDraft(draft as RuntimeState<G>, eventName)
    );
  }
}

function processEventAndMutateStateDraft<
  G extends Generics,
  Event extends G["events"]
>(draft: RuntimeState<G>, eventName: Event) {
  for (const player of draft.players) {
    for (const item of player.items) {
      const itemEffects = item.effects[eventName];
      if (itemEffects) {
        for (const effect of itemEffects) {
          effect(draft);
        }
      }
    }
    for (const card of player.deck.cards) {
      const cardEffects = card.effects[eventName];
      if (cardEffects) {
        for (const effect of cardEffects) {
          effect(draft);
        }
      }
    }
  }
}
