import produce from "immer";
import type { RuntimeContext } from "./state/RuntimeContext";
import type { RuntimeState } from "./state/RuntimeState";
import type { RuntimeLike } from "./RuntimeLike";
import type { EventInput } from "./state/Event";

export class Runtime<G extends RuntimeContext> implements RuntimeLike<G> {
  readonly events: Readonly<G["events"]>;

  constructor(public state: RuntimeState<G>) {
    this.events = new Proxy({} as Readonly<G["events"]>, {
      get:
        (target, prop) =>
        <EventName extends keyof G["events"]>(input: unknown) =>
          this.triggerEvent(
            prop as EventName,
            input as EventInput<G["events"][EventName]>
          ),
    });
  }

  private triggerEvent<EventName extends keyof G["events"]>(
    eventName: EventName,
    input: EventInput<G["events"][EventName]>
  ) {
    this.state = produce(this.state, (draft) => {
      processEventAndMutateStateDraft<G, EventName>(
        draft as RuntimeState<G>,
        eventName,
        input
      );
    });
  }
}

function processEventAndMutateStateDraft<
  G extends RuntimeContext,
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
