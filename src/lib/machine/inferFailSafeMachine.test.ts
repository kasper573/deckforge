import { createMachine } from "./Machine";
import { inferFailSafeMachine } from "./inferFailSafeMachine";

describe("FailsafeMachine", () => {
  it("failing actions do not throw exceptions", () => {
    const machine = createTestMachine(new Error());
    const failsafe = inferFailSafeMachine(machine);
    expect(() => failsafe.actions.fail()).not.toThrow();
  });

  it("can subscribe to errors", () => {
    const error = new Error();
    const machine = createTestMachine(error);
    const failsafe = inferFailSafeMachine(machine);
    const fn = jest.fn();
    failsafe.subscribeToErrors(fn);
    failsafe.actions.fail(5);
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ name: "fail", payload: 5 }),
      error
    );
  });

  it("can unsubscribe from errors", () => {
    const error = new Error();
    const machine = createTestMachine(error);
    const failsafe = inferFailSafeMachine(machine);
    const fn = jest.fn();
    const unsub = failsafe.subscribeToErrors(fn);
    failsafe.actions.fail();
    unsub();
    failsafe.actions.fail();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

function createTestMachine(errorToThrow: Error) {
  return createMachine({ calls: [] as string[] })
    .effects({
      fail(state, payload?: number) {
        throw errorToThrow;
        // noinspection UnreachableCodeJS
        state.calls.push("fail");
      },
      succeed(state) {
        state.calls.push("succeed");
      },
    })
    .build();
}
