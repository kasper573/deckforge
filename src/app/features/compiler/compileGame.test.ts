import { v4 } from "uuid";
import type {
  CardId,
  DeckId,
  EntityId,
  EventId,
  GameDefinition,
  PropertyId,
} from "../../../api/services/game/types";
import { deriveRuntimeDefinition } from "./defineRuntime";
import { compileGame } from "./compileGame";
import type { RuntimeCard, RuntimeGenerics, RuntimePlayerId } from "./types";

describe("compileGame", () => {
  it("can compile without errors", () => {
    const { error } = mockCompile();
    expect(error).toBeUndefined();
  });

  it("successful compilation yields runtime instance", () => {
    const { runtime } = mockCompile();
    expect(runtime).toBeDefined();
  });

  it("compiled runtime event can mutate player property", () => {
    const { runtime } = mockCompile();
    runtime?.actions.attack(5);
    expect(runtime?.state.players[0].properties.health).toBe(5);
    expect(runtime?.state.players[1].properties.health).toBe(5);
  });

  it("compiled runtime card effect can mutate player property", () => {
    const { runtime } = mockCompile();
    runtime!.execute((state) => {
      const [player1, player2] = state.players;
      runtime?.actions.playCard({ player: player1.id, target: player2.id });
      expect(player1.properties.health).toBe(15);
      expect(player2.properties.health).toBe(5);
    });
  });
});

function mockCompile() {
  const gameDefinition: GameDefinition = {
    properties: [
      {
        entityId: "player" as EntityId,
        propertyId: v4() as PropertyId,
        name: "health",
        type: "number",
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
      {
        eventId: v4() as EventId,
        name: "playCard",
        code: ``,
        inputType: { player: "string", target: "string" },
      },
    ],
    cards: [
      {
        cardId: v4() as CardId,
        deckId: v4() as DeckId,
        name: "Lifesteal",
        propertyDefaults: {},
        code: `
define({
  playCard (state, {player: playerId, target: targetId}) {
    const player = state.players.find((p) => p.id === playerId);
    const target = state.players.find((p) => p.id === targetId);
    if (player && target) {
      player.properties.health += 5;
      target.properties.health -= 5;
    }
  }
})`,
      },
    ],
    decks: [],
  };
  const runtimeDefinition = deriveRuntimeDefinition(gameDefinition);
  return compileGame(runtimeDefinition, gameDefinition, (decks) => {
    const deck = Array.from(decks.values())[0];
    return {
      players: [mockPlayer(deck), mockPlayer([])],
    };
  });
}

function mockPlayer<G extends RuntimeGenerics>(deck: RuntimeCard<G>[]) {
  return {
    id: v4() as RuntimePlayerId,
    properties: { health: 10 },
    cards: {
      hand: [],
      deck,
      discard: [],
      draw: [],
    },
  };
}
