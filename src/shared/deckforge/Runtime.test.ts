import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { Runtime } from "./Runtime";

describe("deckforge", () => {
  it("card effects react to the correct events", () => {
    type G = Generics<"a" | "b">;

    const fn = jest.fn();

    const runtime = new Runtime<G>(
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
    );

    runtime.events.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.events.a();
    expect(fn).toHaveBeenCalled();
  });

  it("item effects react to the correct events", () => {
    type G = Generics<"a" | "b">;

    const fn = jest.fn();

    const runtime = new Runtime<G>(
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
    );

    runtime.events.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.events.a();
    expect(fn).toHaveBeenCalled();
  });
});
