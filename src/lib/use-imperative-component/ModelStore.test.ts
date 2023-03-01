import { ModelStore } from "./ModelStore";

describe("ImperativeStore", () => {
  it("can add model", () => {
    const store = new ModelStore();
    store.addModel(0, "a");
    expect(store.state).toEqual({ 0: { definition: "a", instances: {} } });
  });

  it("can remove model", () => {
    const store = new ModelStore({ 0: "a" });
    store.removeModel(0);
    expect(store.state).toEqual({});
  });
});
