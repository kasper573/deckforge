import { createModelStore } from "./ModelStore";

describe("ImperativeStore", () => {
  it("can add model", () => {
    const store = createModelStore();
    store.addModel(0, "a");
    expect(store.state).toEqual({ 0: { definition: "a", instances: {} } });
  });

  it("can remove model", () => {
    const store = createModelStore({ 0: "a" });
    store.removeModel(0);
    expect(store.state).toEqual({});
  });

  it("can instantiate model", () => {
    const store = createModelStore({ 0: "a" }, (m, i: number) => m.repeat(i));

    store.instantiate(0, 1, 3);
    expect(store.state[0].instances[1]).toBe("aaa");
  });

  it("can destroy instance", () => {
    const store = createModelStore({ 0: "a" }, (m, input: void) => m);

    store.instantiate(0, 1);
    store.destroyInstance(0, 1);
    expect(store.state[0].instances).toEqual({});
  });
});
