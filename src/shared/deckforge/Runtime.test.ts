import { original } from "immer";
import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { Runtime } from "./Runtime";
import type { RuntimeLike } from "./RuntimeLike";
import type { RuntimeState } from "./state/RuntimeState";
import type { EventExpression } from "./state/Expression";

describe("deckforge", () => {
  describe("card", () => {
    generateEffectTests(
      (fn) =>
        new Runtime<G>(
          { isBattleWon: () => false },
          {
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
                      effects: { a: [fn] },
                    },
                  ],
                },
              },
            ],
          }
        )
    );
  });

  describe("item", () => {
    generateEffectTests(
      (fn) =>
        new Runtime<G>(
          { isBattleWon: () => false },
          {
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
          }
        )
    );
  });
});

type G = Generics<{
  a: () => void;
  b: () => void;
  c: (n: number) => void;
}>;

function generateEffectTests(
  createRuntime: (effect: EventExpression<G>) => RuntimeLike<G>
) {
  describe("effect", () => {
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
  });
}
