import { cloneDeep } from "lodash";
import { createMutateFn } from "./createMutateFn";

it(`seems to be able to mutate args`, () => {
  type State = ReturnType<typeof create>;
  const create = (health: number) => ({
    players: [
      { id: 0, properties: { health } },
      { id: 1, properties: { health } },
    ],
  });

  const damage = emulate((state: State, playerId: number, amount: number) => {
    const player = state.players.find((p) => p.id === playerId);
    if (player) {
      player.properties.health -= amount;
    }
  });

  const program = emulate(
    (state: State, health: { initial: number; damage: number }) => {
      for (const player of state.players) {
        player.properties.health = health.initial;
        damage(state, player.id, health.damage);
      }
    }
  );

  const mutate = createMutateFn();

  const state = create(0);
  program(state, { initial: 10, damage: 3 });
  expect(state).toEqual(create(7));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function emulate<T extends (...args: any[]) => any>(fn: T) {
    return ((...originalArgs: Parameters<T>) => {
      const innerArgs = originalArgs.map(cloneDeep);
      const result = fn(...innerArgs);
      mutate(originalArgs, innerArgs);
      return result;
    }) as T;
  }
});
