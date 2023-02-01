export function createEventBus<Payload = void>() {
  const handlers: Set<(payload: Payload) => void> = new Set();

  function emit(payload: CoerceOptional<Payload>) {
    return handlers.forEach((h) => h(payload as Payload));
  }

  function subscribe(handler: (payload: Payload) => void) {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }

  return { emit, subscribe };
}

type CoerceOptional<T> = T extends undefined ? void : T;
