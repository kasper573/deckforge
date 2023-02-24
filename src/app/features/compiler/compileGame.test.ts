import { v4 } from "uuid";
import { z } from "zod";
import { getQuickJS } from "quickjs-emscripten";
import type {
  CardId,
  DeckId,
  EntityId,
  EventId,
  Game,
  GameDefinition,
  ReducerId,
  PropertyId,
} from "../../../api/services/game/types";
import { defineRuntime, deriveRuntimeDefinitionParts } from "./defineRuntime";
import type { CompileGameResult } from "./compileGame";
import { compileGame } from "./compileGame";
import type { GameRuntime, RuntimeGenerics } from "./types";
import type { RuntimeDefinition } from "./types";
import type { ModuleCompiler } from "./moduleRuntimes/types";
import { createQuickJSCompiler } from "./moduleRuntimes/QuickJS/QuickJSCompiler";

let moduleCompiler: ModuleCompiler;

describe("compileGame", () => {
  beforeEach(async () => {
    const quickJS = await getQuickJS();
    moduleCompiler = createQuickJSCompiler({
      createRuntime: () => quickJS.newRuntime(),
    });
  });

  it("can compile game with a single event without errors", () => {
    const gameDefinition: GameDefinition = {
      reducers: [],
      properties: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "attack",
          code: `define(() => {});`,
          inputType: "number",
        },
      ],
      cards: [],
      decks: [],
    };
    useGameCompiler(
      defineTestRuntime(gameDefinition),
      gameDefinition,
      (result) => {
        expect(result).toEqual({ value: expect.any(Object) });
      }
    );
  });

  it("compiled event can mutate player property", () => {
    const gameDefinition: GameDefinition = {
      reducers: [],
      properties: [
        {
          entityId: "player" as EntityId,
          propertyId: v4() as PropertyId,
          name: "health",
          type: "number",
          defaultValue: 10,
        },
      ],
      events: [
        {
          eventId: v4() as EventId,
          name: "attack",
          code: `
define((state, damage) => {
  for (const player of state.players) {
    player.properties.health -= damage;
  }
});`,
          inputType: "number",
        },
      ],
      cards: [],
      decks: [],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.actions.attack(5);
      expect(runtime.state.players[0].properties.health).toBe(5);
      expect(runtime.state.players[1].properties.health).toBe(5);
    });
  });

  it("compiled event can add card to draw pile", () => {
    const deckId = v4() as DeckId;
    const gameDefinition: GameDefinition = {
      properties: [],
      reducers: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "addCard",
          inputType: "void",
          code: `
define((state) => {
  const deck = state.decks[0].cards;
  for (const player of state.players) {
    player.board.draw.push(deck[0]);
  }
});`,
        },
      ],
      cards: [
        {
          cardId: v4() as CardId,
          deckId,
          name: "Foo",
          propertyDefaults: {},
          code: ``,
        },
      ],
      decks: [{ deckId, name: "Test Deck" }],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.actions.addCard();
      const [player1] = runtime.state.players;
      expect(player1.board.draw.length).toBe(1);
      expect(player1.board.draw.at(0)).toEqual(runtime.state.decks[0].cards[0]);
    });
  });

  it("compiled card effect can mutate player property", () => {
    const deckId = v4() as DeckId;
    const gameDefinition: GameDefinition = {
      properties: [
        {
          entityId: "player" as EntityId,
          propertyId: v4() as PropertyId,
          name: "health",
          type: "number",
          defaultValue: 10,
        },
      ],
      reducers: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "play",
          code: ``,
          inputType: { player: "string", target: "string" },
        },
      ],
      cards: [
        {
          cardId: v4() as CardId,
          deckId,
          name: "Lifesteal",
          propertyDefaults: {},
          code: `
define({
  play (state, {player: playerId, target: targetId, cardId}) {
    const player = state.players.find((p) => p.id === playerId);
    const target = state.players.find((p) => p.id === targetId);
    const card = player.board.hand.find((c) => c.id === cardId);
    if (card) {
      player.properties.health += 5;
      target.properties.health -= 5;
    }
  }
})`,
        },
      ],
      decks: [{ deckId, name: "Test Deck" }],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.execute((state) => {
        const [player1, player2] = state.players;
        const [card] = state.decks[0].cards;
        player1.board.hand.push(card);
        runtime?.actions.play({
          player: player1.id,
          target: player2.id,
          cardId: card.id,
        });
        expect(player1.properties.health).toBe(15);
        expect(player2.properties.health).toBe(5);
      });
    });
  });

  it("cloned card effect can mutate player property", () => {
    const deckId = v4() as DeckId;
    const gameDefinition: GameDefinition = {
      properties: [
        {
          entityId: "player" as EntityId,
          propertyId: v4() as PropertyId,
          name: "health",
          type: "number",
          defaultValue: 10,
        },
      ],
      reducers: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "clone",
          code: `
define(({players, decks: [deck]}) => {
  for (const player of players) {
    player.board.hand.push(cloneCard(deck.cards[0]));
  }
})`,
          inputType: { player: "string", target: "string" },
        },
        {
          eventId: v4() as EventId,
          name: "play",
          code: ``,
          inputType: { player: "string", target: "string" },
        },
      ],
      cards: [
        {
          cardId: v4() as CardId,
          deckId,
          name: "Lifesteal",
          propertyDefaults: {},
          code: `
define({
  play (state, {player: playerId, target: targetId, cardId}) {
    const player = state.players.find((p) => p.id === playerId);
    const target = state.players.find((p) => p.id === targetId);
    const card = player.board.hand.find(c => c.id === cardId);
    if (card?.typeId === thisCardId) {
      player.properties.health += 5;
      target.properties.health -= 5;
    }
  }
})`,
        },
      ],
      decks: [{ deckId, name: "Test Deck" }],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.execute((state) => {
        const [player1, player2] = state.players;
        runtime?.actions.clone();
        runtime?.actions.play({
          player: player1.id,
          target: player2.id,
          cardId: player1.board.hand[0].id,
        });
        expect(player1.properties.health).toBe(15);
        expect(player2.properties.health).toBe(5);
      });
    });
  });

  describe("compiled runtime entities have correct default property values", () => {
    const properties = {
      num: {
        entityId: "player" as EntityId,
        propertyId: v4() as PropertyId,
        name: "num",
        type: "number" as const,
      },
      str: {
        entityId: "card" as EntityId,
        propertyId: v4() as PropertyId,
        name: "str",
        type: "string" as const,
      },
    };
    const deckId = v4() as DeckId;
    const gameDefinition: GameDefinition = {
      properties: Object.values(properties),
      events: [],
      reducers: [],
      cards: [
        {
          cardId: v4() as CardId,
          deckId,
          name: "baz",
          propertyDefaults: {
            [properties.str.propertyId]: "default",
          },
          code: ``,
        },
      ],
      decks: [
        {
          deckId,
          name: "Test Deck",
        },
      ],
    };
    it("player properties", () => {
      const runtimeDefinition = defineTestRuntime(gameDefinition);
      useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
        expect(runtime.state.players[0].properties.num).toBe(0);
        expect(runtime.state.players[1].properties.num).toBe(0);
      });
    });

    it("card properties", () => {
      const runtimeDefinition = defineTestRuntime(gameDefinition);
      useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
        expect(runtime.state.decks[0].cards[0].properties.str).toBe("default");
      });
    });
  });

  it("compiled runtime can reuse events inside events", () => {
    const gameDefinition: GameDefinition = {
      properties: [],
      reducers: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "increase",
          code: `
          define((state, n) => {
            state.properties.status += n;
          });
          `,
          inputType: "number",
        },
        {
          eventId: v4() as EventId,
          name: "decrease",
          code: `
          define((state, n) => {
            state.properties.status -= n;
          });
          `,
          inputType: "number",
        },
        {
          eventId: v4() as EventId,
          name: "calculate",
          code: `
          define((state) => {
            state.properties.status = 10;
            events.increase(state, 20);
            events.decrease(state, 5);
          });
          `,
          inputType: "void",
        },
      ],
      cards: [],
      decks: [],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.execute((state) => {
        runtime.actions.calculate();
        expect(state.properties.status).toBe(25);
      });
    });
  });

  it("compiled runtime can recurse events ", () => {
    const gameDefinition: GameDefinition = {
      properties: [],
      reducers: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "increaseN",
          code: `
          define((state, n) => {
            if (n > 0) {
              state.properties.status++;
              events.increaseN(state, n - 1);
            }
          });
          `,
          inputType: "number",
        },
      ],
      cards: [],
      decks: [],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.execute((state) => {
        runtime.actions.increaseN(10);
        expect(state.properties.status).toBe(10);
      });
    });
  });

  it("compiled reducer can read and mutate state", () => {
    const gameDefinition: GameDefinition = {
      reducers: [
        {
          reducerId: v4() as ReducerId,
          name: "make player 1 win",
          code: `define((state) => {
            state.properties.status = { type: "result", winner: state.players[0].id };
          })`,
        },
      ],
      properties: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "foo",
          code: ``,
          inputType: "void",
        },
      ],
      cards: [],
      decks: [],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.actions.foo();
      expect(runtime!.state.properties.status).toEqual({
        type: "result",
        winner: runtime!.state.players[0].id,
      });
    });
  });

  it("can compile multiple reducers", () => {
    const gameDefinition: GameDefinition = {
      reducers: [
        {
          reducerId: v4() as ReducerId,
          name: "set to 1",
          code: `define((state, action) => {
            state.properties.status = 1;
          })`,
        },
        {
          reducerId: v4() as ReducerId,
          name: "add 2",
          code: `define((state) => {
            state.properties.status += 2;
          })`,
        },
        {
          reducerId: v4() as ReducerId,
          name: "subtract 1",
          code: `define((state) => {
            state.properties.status -= 1;
          })`,
        },
      ],
      properties: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "foo",
          code: ``,
          inputType: "void",
        },
      ],
      cards: [],
      decks: [],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    useGameRuntime(runtimeDefinition, gameDefinition, (runtime) => {
      runtime.actions.foo();
      expect(runtime.state.properties.status).toEqual(2);
    });
  });
});

function useGameRuntime<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  handle: (runtime: GameRuntime<G>) => void
) {
  useGameCompiler(runtimeDefinition, gameDefinition, (result) => {
    if (result.isErr()) {
      throw new Error(result.error.join("\n"));
    }
    handle(result.value.runtime);
  });
}

function useGameCompiler<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  handle: (result: CompileGameResult<G>) => void
) {
  const result = compileGame<G>(runtimeDefinition, gameDefinition, {
    moduleCompiler,
  });
  try {
    handle(result);
  } finally {
    if (result.isOk()) {
      result.value.dispose();
    }
  }
}

function defineTestRuntime(gameDefinition: Game["definition"]) {
  return defineRuntime({
    ...deriveRuntimeDefinitionParts(gameDefinition),
    globalProperties: () => ({
      status: z.number(),
    }),
    initialState: ({ decks, createPlayer }) => {
      const p1 = createPlayer();
      const p2 = createPlayer();
      return {
        decks,
        players: [p1, p2],
        properties: {
          status: 0,
        },
      };
    },
  });
}
