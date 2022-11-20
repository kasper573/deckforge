import { original } from "immer";
import { Machine } from "./Machine";
import type { MachineContext } from "./MachineContext";
import type { AnyMachineReaction } from "./MachineAction";
import type { MachineReactionCollection } from "./MachineAction";

describe("Machine", () => {
  describe("actions", () => {
    generateTestCases((reaction) => new Machine({}, { a: reaction }));
  });

  describe("reactions", () => {
    generateTestCases(
      (reaction) =>
        new Machine(
          { reactions: { a: [reaction] } },
          {},
          (state, actionName) => state.reactions?.[actionName]
        )
    );
  });
});

function generateTestCases(
  createMachine: (reaction: AnyMachineReaction<Context>) => Machine<Context>
) {
  it("reacts to the correct actions", () => {
    const fn = jest.fn();
    const runtime = createMachine(fn);
    runtime.actions.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.actions.a();
    expect(fn).toHaveBeenCalled();
  });

  it("can receive state", () => {
    let receivedState: unknown;
    const runtime = createMachine((state) => {
      receivedState = original(state);
    });
    const startState = runtime.state;
    runtime.actions.a();
    expect(receivedState).toEqual(startState);
  });

  it("can receive input", () => {
    let receivedInput: number | undefined;
    const runtime = createMachine((state, input) => {
      receivedInput = input;
    });
    runtime.actions.a(123);
    expect(receivedInput).toBe(123);
  });

  it("can update state", () => {
    const runtime = createMachine((state) => {
      state.value = "Updated";
    });
    runtime.actions.a();
    expect(runtime.state.value).toBe("Updated");
  });

  it("updates does not mutate current state", () => {
    const runtime = createMachine((state) => {
      state.value = "Updated";
    });
    const stateBeforeAction = runtime.state;
    runtime.actions.a();
    expect(runtime.state.value).toBe("Updated");
    expect(stateBeforeAction.value).not.toBe("Updated");
  });
}

type Context = MachineContext<State, actions>;

interface State {
  value?: unknown;
  reactions?: MachineReactionCollection<Context>;
}

type actions = {
  a: (n?: number) => void;
  b: () => void;
};
