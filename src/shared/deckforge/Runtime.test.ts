import { original } from "immer";
import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { Runtime } from "./Runtime";
import type { RuntimeState } from "./state/RuntimeState";
import type { EventExpression } from "./state/Expression";

describe("deckforge", () => {
  describe("card", () => {
    const createState = (effect: EventExpression<G>) => ({
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
                cost: () => 0,
                canBePlayed: () => true,
                effects: { a: [effect] },
              },
            ],
          },
        },
      ],
    });

    describe("effects", () => {
      generateEffectTests(createState);
    });
  });

  describe("item", () => {
    describe("effects", () => {
      generateEffectTests((fn) => ({
        players: [
          {
            name: "Test Player",
            items: [
              {
                id: createId(),
                name: "Test Item",
                type: "foo",
                effects: { a: [fn] },
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

type G = Generics<{
  a: (n?: number) => void;
  b: () => void;
}>;

function generateEffectTests(
  createRuntimeState: (effect: EventExpression<G>) => RuntimeState<G>
) {
  const createRuntime = (effect: EventExpression<G>) =>
    new Runtime({ isBattleWon: () => false }, createRuntimeState(effect));

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
