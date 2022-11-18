import type { DeepReadonly } from "ts-essentials";
import type { Generics } from "./state/Generics";
import type { Rules } from "./state/Rules";
import type { RuntimeState } from "./state/RuntimeState";
import type { RuntimeLike, RuntimeEventEmitters } from "./RuntimeLike";
import type { Expression } from "./state/Expression";

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
    for (const player of this._state.players) {
      for (const item of player.items) {
        triggerEffects(item.effects[eventName]);
      }
      for (const card of player.deck.cards) {
        triggerEffects(card.effects[eventName]);
      }
    }
  }
}

function triggerEffects(effects?: Expression[]) {
  if (effects) {
    for (const effect of effects) {
      effect();
    }
  }
}
