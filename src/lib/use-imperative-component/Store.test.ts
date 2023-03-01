import { Store } from "./Store";

describe("Store", () => {
  it("can initialize with state", () => {
    const initial = { 0: "a" };
    const store = new Store(initial);
    expect(store.state).toBe(initial);
  });

  describe("mutate", () => {
    const initialState = 5;
    const expectedState = 10;
    const mutate = (store: Store<number>) => store.mutate((n) => n + 5);

    it("store contains expected state afterwards", () => {
      const store = new Store(initialState);
      mutate(store);
      expect(store.state).toEqual(expectedState);
    });

    it("emits an event with the updated state", () => {
      const store = new Store(initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      mutate(store);
      expect(listener).toHaveBeenCalledWith(expectedState, expect.anything());
    });

    it("emits an event with the previous state", () => {
      const store = new Store(initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      mutate(store);
      expect(listener).toHaveBeenCalledWith(expect.anything(), initialState);
    });

    it("stops emitting after unsubscribing", () => {
      const store = new Store(initialState);
      const listener = jest.fn();
      const unsub = store.subscribe(listener);
      mutate(store);
      unsub();
      mutate(store);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
