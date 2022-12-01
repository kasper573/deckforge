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
      const machine = createActionMachine((state, input) => {
        receivedInput = input;
      });
      machine.actions.a(123);
      expect(receivedInput).toBe(123);
    });

    it("can update state", () => {
      const machine = createActionMachine((state) => {
        state.value = "Updated";
      });
      machine.actions.a();
      expect(machine.state.value).toBe("Updated");
    });

    it("updates does not mutate current state", () => {
      const machine = createActionMachine((state) => {
        state.value = "Updated";
      });
      const stateBeforeAction = machine.state;
      machine.actions.a();
      expect(machine.state.value).toBe("Updated");
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
      const machine = createReactionMachine((state, { input }) => {
        receivedInput = input;
      });
      machine.actions.a(123);
      expect(receivedInput).toBe(123);
    });

    it("can update state", () => {
      const machine = createReactionMachine((state) => {
        state.value = "Updated";
      });
      machine.actions.a();
      expect(machine.state.value).toBe("Updated");
    });

    it("updates does not mutate current state", () => {
      const machine = createReactionMachine((state) => {
        state.value = "Updated";
      });
      const stateBeforeAction = machine.state;
      machine.actions.a();
      expect(machine.state.value).toBe("Updated");
      expect(stateBeforeAction.value).not.toBe("Updated");
    });
  });

  describe("execution context", () => {
    it("state changes from actions are reflected in the context state draft", () => {
      const machine = createMachine({ value: "start" })
        .actions({
          change(state) {
            state.value = "changed";
          },
        })
        .build();

      machine.execute((state) => {
        machine.actions.change();
        expect(state.value).toBe("changed");
      });
    });

    it("actions impact machine state once execution finishes", () => {
      const machine = createMachine({ count: 0 })
        .actions({
          increase(state) {
            state.count++;
          },
        })
        .build();

      machine.execute(() => {
        machine.actions.increase();
        machine.actions.increase();
        machine.actions.increase();
        expect(machine.state.count).toBe(0);
      });

      expect(machine.state.count).toBe(3);
    });
  });
});

function createActionMachine(fn: AnyMachineAction) {
  return createMachine({ value: undefined as unknown })
    .actions({
      a(state, n?: number) {
        return fn(state, n);
      },
      b() {},
    })
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
