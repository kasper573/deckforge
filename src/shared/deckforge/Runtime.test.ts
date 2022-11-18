import { original } from "immer";
import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { Runtime } from "./Runtime";
import type { RuntimeState } from "./state/RuntimeState";
import type { EventExpression } from "./state/Expression";
import type { Card } from "./state/Card";

describe("deckforge", () => {
  describe("card", () => {
    const createState = (
      options: {
        effect?: EventExpression<G>;
        settings: G["settings"];
      } & Partial<Pick<Card<G>, "cost" | "canBePlayed">>
    ) => ({
      settings: options.settings,
      players: [
        {
          name: "Test Player",
          items: [],
          resources: {},
          deck: {
            name: "Test Deck",
            cards: [
              {
                id: createId(),
                name: "Test Card",
                type: "foo",
                cost: options?.cost ?? (() => 0),
                canBePlayed: options?.canBePlayed ?? (() => true),
                effects: { a: options.effect ? [options.effect] : [] },
              },
            ],
          },
        },
      ],
    });

    it("can derive cost from state", () => {
      const runtime = new Runtime(
        createState({
          settings: { num: 5 },
          cost: (state) => state.settings.num,
        })
      );
      expect(
        runtime.state.players[0]?.deck.cards[0]?.cost?.(runtime.state)
      ).toBe(5);
    });

    describe("effects", () => {
      generateEffectTests((effect) =>
        createState({ effect, settings: { num: 0 } })
      );
    });
  });

  describe("item", () => {
    describe("effects", () => {
      generateEffectTests((effect) => ({
        settings: { num: 0 },
        players: [
          {
            name: "Test Player",
            items: [
              {
                id: createId(),
                name: "Test Item",
                type: "foo",
                effects: { a: [effect] },
              },
            ],
            resources: {},
            deck: {
              name: "Test Deck",
              cards: [],
            },
          },
        ],
      }));
    });
  });
});

type G = Generics<
  {
    a: (n?: number) => void;
    b: () => void;
  },
  { num: number }
>;

function generateEffectTests(
  createState: (effect: EventExpression<G>) => RuntimeState<G>
) {
  const createRuntime = (effect: EventExpression<G>) =>
    new Runtime(createState(effect));

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
    const runtime = createRuntime((state: RuntimeState<G>) => {
      const [player] = state.players;
      if (player) {
        player.name = "Updated";
      }
    });
    runtime.events.a();
    expect(runtime.state.players[0]?.name).toBe("Updated");
  });

  it("updates does not mutate current state", () => {
    const runtime = createRuntime((state: RuntimeState<G>) => {
      const [player] = state.players;
      if (player) {
        player.name = "Updated";
      }
    });
    const stateBeforeEvent = runtime.state;
    runtime.events.a();
    expect(runtime.state.players[0]?.name).toBe("Updated");
    expect(stateBeforeEvent.players[0]?.name).not.toBe("Updated");
  });
}
