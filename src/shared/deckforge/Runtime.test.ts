import { original } from "immer";
import { createId } from "./createId";
import { Runtime } from "./Runtime";
import type { Card } from "./state/Card";
import type { Player } from "./state/Player";
import type { EventHandlerExpression } from "./state/EventHandler";
import type { EventHandlerSelector } from "./state/EventHandler";

describe("Runtime", () => {
  describe("card", () => {
    const createState = (options: {
      effect?: EventHandlerExpression<RC>;
      num?: number;
      playable?: Card<RC>["playable"];
    }): RC["state"] => ({
      num: options.num ?? 0,
      player: {
        id: createId(),
        items: [],
        props: { name: "Foo" },
        deck: {
          props: { name: "Foo" },
          cards: [
            {
              id: createId(),
              playable: options?.playable ?? (() => true),
              effects: { a: options.effect ? [options.effect] : [] },
              props: { name: "Foo" },
            },
          ],
        },
      },
    });

    it("can derive playable from state and input", () => {
      const { state } = new Runtime<RC>(
        createState({
          num: 3,
          playable: ({ self, state }) =>
            state.num + self.props.name.length === 6,
        }),
        selectEventHandlers
      );
      const [self] = state.player.deck.cards;
      expect(self?.playable?.({ state, self })).toBe(true);
    });

    describe("effects", () => {
      generateEffectTests((effect) => createState({ effect }));
    });
  });

  describe("item", () => {
    describe("effects", () => {
      generateEffectTests((effect) => ({
        num: 0,
        player: {
          id: createId(),
          props: { name: "Foo" },
          items: [
            {
              id: createId(),
              effects: { a: [effect] },
              props: { name: "Foo" },
            },
          ],
          deck: {
            cards: [],
            props: {},
          },
        },
      }));
    });
  });
});

interface RC {
  events: {
    a: (n?: number) => void;
    b: () => void;
  };
  state: {
    num: number;
    player: Player<RC>;
  };
  battleProps: unknown;
  playerProps: { name: string };
  itemProps: { name: string };
  cardProps: { name: string };
  deckProps: unknown;
  playerCardPiles: string;
  battleCardPiles: string;
}

const selectEventHandlers: EventHandlerSelector<RC> = function* (
  { player },
  eventName
) {
  for (const item of player.items) {
    const itemEffects = item.effects[eventName];
    if (itemEffects) {
      for (const effect of itemEffects) {
        yield effect;
      }
    }
  }
  for (const card of player.deck.cards) {
    const cardEffects = card.effects[eventName];
    if (cardEffects) {
      for (const effect of cardEffects) {
        yield effect;
      }
    }
  }
};

function generateEffectTests(
  createState: (effect: EventHandlerExpression<RC>) => RC["state"]
) {
  const createRuntime = (effect: EventHandlerExpression<RC>) =>
    new Runtime<RC>(createState(effect), selectEventHandlers);

  it("reacts to the correct events", () => {
    const fn = jest.fn();
    const runtime = createRuntime(fn);
    runtime.events.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.events.a();
    expect(fn).toHaveBeenCalled();
  });

  it("can receive state", () => {
    let receivedState: unknown;
    const runtime = createRuntime((immerDraft) => {
      receivedState = original(immerDraft);
    });
    const startState = runtime.state;
    runtime.events.a();
    expect(receivedState).toEqual(startState);
  });

  it("can receive input", () => {
    let receivedInput: unknown;
    const runtime = createRuntime((state, input) => {
      receivedInput = input;
    });
    runtime.events.a(123);
    expect(receivedInput).toBe(123);
  });

  it("can update state", () => {
    const runtime = createRuntime((state) => {
      state.player.props.name = "Updated";
    });
    runtime.events.a();
    expect(runtime.state.player.props.name).toBe("Updated");
  });

  it("updates does not mutate current state", () => {
    const runtime = createRuntime((state) => {
      state.player.props.name = "Updated";
    });
    const stateBeforeEvent = runtime.state;
    runtime.events.a();
    expect(runtime.state.player.props.name).toBe("Updated");
    expect(stateBeforeEvent.player.props.name).not.toBe("Updated");
  });
}
