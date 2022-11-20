import { original } from "immer";
import { createMachine } from "./Machine";
import type { AnyMachineAction, AnyMachineReaction } from "./MachineAction";

describe("Machine", () => {
  describe("actions", () => {
    it("performs to the correct action", () => {
      const fn = jest.fn();
      const machine = createActionMachine(fn);
      machine.actions.b();
      expect(fn).not.toHaveBeenCalled();
      machine.actions.a();
      expect(fn).toHaveBeenCalled();
    });

    it("can produce output", () => {
      const fn = () => 123;
      const machine = createActionMachine(fn);
      const res = machine.actions.a();
      expect(res).toBe(123);
    });

    it("can receive state", () => {
      let receivedState: unknown;
      const machine = createActionMachine((state) => {
        receivedState = original(state);
      });
      const startState = machine.state;
      machine.actions.a();
      expect(receivedState).toEqual(startState);
    });

    it("can receive input", () => {
      let receivedInput: number | undefined;
      const runtime = createActionMachine((state, input) => {
        receivedInput = input;
      });
      runtime.actions.a(123);
      expect(receivedInput).toBe(123);
    });

    it("can update state", () => {
      const runtime = createActionMachine((state) => {
        state.value = "Updated";
      });
      runtime.actions.a();
      expect(runtime.state.value).toBe("Updated");
    });

    it("updates does not mutate current state", () => {
      const runtime = createActionMachine((state) => {
        state.value = "Updated";
      });
      const stateBeforeAction = runtime.state;
      runtime.actions.a();
      expect(runtime.state.value).toBe("Updated");
      expect(stateBeforeAction.value).not.toBe("Updated");
    });
  });

  describe("reactions", () => {
    it("reacts to the correct actions", () => {
      const fn = jest.fn();
      const machine = createReactionMachine(fn);
      machine.actions.b();
      expect(fn).not.toHaveBeenCalled();
      machine.actions.a();
      expect(fn).toHaveBeenCalled();
    });

    it("can receive state", () => {
      let receivedState: unknown;
      const machine = createReactionMachine((state) => {
        receivedState = original(state);
      });
      const startState = machine.state;
      machine.actions.a();
      expect(receivedState).toEqual(startState);
    });

    it("can receive input", () => {
      let receivedInput: number | undefined;
      const runtime = createReactionMachine((state, output, input) => {
        receivedInput = input;
      });
      runtime.actions.a(123);
      expect(receivedInput).toBe(123);
    });

    it("can update state", () => {
      const runtime = createReactionMachine((state) => {
        state.value = "Updated";
      });
      runtime.actions.a();
      expect(runtime.state.value).toBe("Updated");
    });

    it("updates does not mutate current state", () => {
      const runtime = createReactionMachine((state) => {
        state.value = "Updated";
      });
      const stateBeforeAction = runtime.state;
      runtime.actions.a();
      expect(runtime.state.value).toBe("Updated");
      expect(stateBeforeAction.value).not.toBe("Updated");
    });
  });
});

function createActionMachine(fn: AnyMachineAction) {
  return createMachine({ value: undefined as unknown })
    .actions({ a: fn, b() {} })
    .build();
}

function createReactionMachine(fn: AnyMachineReaction) {
  return createMachine({
    value: undefined as unknown,
    reactions: { a: [fn], b: [] },
  })
    .actions({ a(state, n?: number) {}, b() {} })
    .reactions((state, actionName) => state.reactions[actionName])
    .build();
}
