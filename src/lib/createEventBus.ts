export function createEventBus() {
  const handlers: Set<() => void> = new Set();
  const emit = () => handlers.forEach((h) => h());
  const subscribe = (handler: () => void) => {
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  };
  return { emit, subscribe };
}
