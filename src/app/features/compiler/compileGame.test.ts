import { v4 } from "uuid";
import { z } from "zod";
import type {
  CardId,
  DeckId,
  EntityId,
  EventId,
  Game,
  GameDefinition,
  MiddlewareId,
  PropertyId,
} from "../../../api/services/game/types";
import { defineRuntime, deriveRuntimeDefinitionParts } from "./defineRuntime";
import { compileGame } from "./compileGame";
import type { RuntimeGenerics } from "./types";

describe("compileGame", () => {
  it("can compile game with a single event without errors", () => {
    const gameDefinition: GameDefinition = {
      middlewares: [],
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
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    const { errors, runtime } = compileGame(runtimeDefinition, gameDefinition);
    expect(errors).toBeUndefined();
    expect(runtime).toBeDefined();
  });

  it("compiled event can mutate player property", () => {
    const gameDefinition: GameDefinition = {
      middlewares: [],
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);

    runtime.actions.attack(5);
    expect(runtime.state.players[0].properties.health).toBe(5);
    expect(runtime.state.players[1].properties.health).toBe(5);
  });

  it("compiled event can add card to draw pile", () => {
    const deckId = v4() as DeckId;
    const gameDefinition: GameDefinition = {
      properties: [],
      middlewares: [],
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
    runtime.actions.addCard();
    const [player1] = runtime.state.players;
    expect(player1.board.draw.length).toBe(1);
    expect(player1.board.draw.at(0)).toBe(runtime.state.decks[0].cards[0]);
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
      middlewares: [],
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);

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
      middlewares: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "clone",
          code: `
derive(({cloneCard}) => ({players, decks: [deck]}) => {
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
derive(({thisCardId}) => ({
  play (state, {player: playerId, target: targetId, cardId}) {
    const player = state.players.find((p) => p.id === playerId);
    const target = state.players.find((p) => p.id === targetId);
    const card = player.board.hand.find(c => c.id === cardId);
    if (card?.typeId === thisCardId) {
      player.properties.health += 5;
      target.properties.health -= 5;
    }
  }
}))`,
        },
      ],
      decks: [{ deckId, name: "Test Deck" }],
    };
    const runtimeDefinition = defineTestRuntime(gameDefinition);
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);

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
      middlewares: [],
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
      const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
      expect(runtime.state.players[0].properties.num).toBe(0);
      expect(runtime.state.players[1].properties.num).toBe(0);
    });

    it("card properties", () => {
      const runtimeDefinition = defineTestRuntime(gameDefinition);
      const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
      expect(runtime.state.decks[0].cards[0].properties.str).toBe("default");
    });
  });

  it("compiled runtime can chain events ", () => {
    const gameDefinition: GameDefinition = {
      properties: [
        {
          entityId: "player" as EntityId,
          propertyId: v4() as PropertyId,
          name: "count",
          type: "number",
        },
      ],
      middlewares: [],
      events: [
        {
          eventId: v4() as EventId,
          name: "increaseUntil",
          code: `
          derive(({actions}) => (state, max) => {
            const [player] = state.players;
            if (player.properties.count < max) {
              player.properties.count++;
              actions.increaseUntil(max);
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
    runtime.execute((state) => {
      runtime.actions.increaseUntil(10);
      expect(state.players[0].properties.count).toBe(10);
    });
  });

  it("compiled middleware can read and mutate state", () => {
    const gameDefinition: GameDefinition = {
      middlewares: [
        {
          middlewareId: v4() as MiddlewareId,
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
    runtime!.actions.foo();
    expect(runtime!.state.properties.status).toEqual({
      type: "result",
      winner: runtime!.state.players[0].id,
    });
  });

  it("compiled middleware can opt out of next middleware", () => {
    const gameDefinition: GameDefinition = {
      middlewares: [
        {
          middlewareId: v4() as MiddlewareId,
          name: "set to 1",
          code: `define((state, action, next) => {
            state.properties.status = 1;
            next();
          })`,
        },
        {
          middlewareId: v4() as MiddlewareId,
          name: "add 2",
          code: `define((state) => {
            state.properties.status += 2;
          })`,
        },
        {
          middlewareId: v4() as MiddlewareId,
          name: "set to 0",
          code: `define((state) => {
            state.properties.status = 0;
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
    const runtime = tryCompileGame(runtimeDefinition, gameDefinition);
    runtime!.actions.foo();
    expect(runtime!.state.properties.status).toEqual(3);
  });
});

function tryCompileGame<G extends RuntimeGenerics>(
  ...args: Parameters<typeof compileGame<G>>
) {
  const { runtime, errors } = compileGame<G>(...args);
  if (errors) {
    throw new Error(errors.join(", "));
  }
  return runtime!;
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
