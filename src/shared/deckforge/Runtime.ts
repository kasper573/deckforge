import type { DeepReadonly } from "ts-essentials";
import produce from "immer";
import type { Generics } from "./state/Generics";
import type { RuntimeState } from "./state/RuntimeState";
import type { RuntimeLike } from "./RuntimeLike";
import type { EventInput } from "./state/Event";

export class Runtime<G extends Generics> implements RuntimeLike<G> {
  readonly events: Readonly<G["events"]>;

  private _state: RuntimeState<G>;
  get state() {
    return this._state as unknown as DeepReadonly<RuntimeState<G>>;
  }

  constructor(initialState: RuntimeState<G>) {
    this._state = initialState;
    this.events = new Proxy({} as Readonly<G["events"]>, {
      get: (target, prop) => (input: unknown) => this.triggerEvent(prop, input),
    });
  }

  private triggerEvent<EventName extends keyof G["events"]>(
    eventName: EventName,
    input: EventInput<G["events"][EventName]>
  ) {
    this._state = produce(this._state, (draft) =>
      processEventAndMutateStateDraft(
        draft as RuntimeState<G>,
        eventName,
        input
      )
    );
  }
}

function processEventAndMutateStateDraft<
  G extends Generics,
  EventName extends keyof G["events"]
>(
  draft: RuntimeState<G>,
  eventName: EventName,
  input: EventInput<G["events"][EventName]>
) {
  for (const player of draft.players) {
    for (const item of player.items) {
      const itemEffects = item.effects[eventName];
      if (itemEffects) {
        for (const effect of itemEffects) {
          effect(draft, input);
        }
      }
    }
    for (const card of player.deck.cards) {
      const cardEffects = card.effects[eventName];
      if (cardEffects) {
        for (const effect of cardEffects) {
          effect(draft, input);
        }
      }
    }
  }
}
