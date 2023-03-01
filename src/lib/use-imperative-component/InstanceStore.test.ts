import { createInstanceStore } from "./InstanceStore";

describe("InstanceStore", () => {
  it("can add model", () => {
    const store = createInstanceStore();
    store.upsertModel(0, "a");
    expect(store.state).toEqual({ 0: { definition: "a", instances: {} } });
  });

  it("can remove model", () => {
    const store = createInstanceStore({ 0: "a" });
    store.deleteModel(0);
    expect(store.state).toEqual({});
  });

  it("can instantiate model", () => {
    const store = createInstanceStore({ 0: "a" }, (m, i: number) =>
      m.repeat(i)
    );

    store.upsertInstance(0, 1, 3);
    expect(store.state[0].instances[1]).toBe("aaa");
  });

  it("can destroy instance", () => {
    const store = createInstanceStore({ 0: "a" }, (m, input: void) => m);

    store.upsertInstance(0, 1);
    store.destroyInstance(0, 1);
    expect(store.state[0].instances).toEqual({});
  });
});
