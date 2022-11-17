import type { Generics } from "./state/Generics";
import { createId } from "./createId";
import { createRuntime } from "./createRuntime";

describe("deckforge", () => {
  it("card effects react to the correct events", () => {
    type G = Generics<"a" | "b">;

    const fn = jest.fn();

    const runtime = createRuntime<G>(
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

    runtime.actions.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.actions.a();
    expect(fn).toHaveBeenCalled();
  });
});
