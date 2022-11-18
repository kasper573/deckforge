import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { Runtime } from "./Runtime";
import type { RuntimeLike } from "./RuntimeLike";

describe("deckforge", () => {
  describe("card", () => {
    generateEffectTests(
      (fn) =>
        new Runtime<Generics<"a" | "b">>(
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
        new Runtime<Generics<"a" | "b">>(
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

function generateEffectTests(
  createRuntime: (fn: jest.Mock) => RuntimeLike<Generics<"a" | "b">>
) {
  describe("effects", () => {
    it("reacts to the correct events", () => {
      const fn = jest.fn();
      const runtime = createRuntime(fn);
      runtime.events.b();
      expect(fn).not.toHaveBeenCalled();
      runtime.events.a();
      expect(fn).toHaveBeenCalled();
    });
  });
}
