import { original } from "immer";
import { Machine } from "./Machine";
import type { MachineEventHandlerCollection } from "./MachineEvent";
import type { MachineContext } from "./MachineContext";
import type { AnyMachineEventHandler } from "./MachineEvent";

describe("Machine", () => {
  describe("global event handlers", () => {
    generateTestCases((eventHandler) => new Machine({}, { a: [eventHandler] }));
  });

  describe("state derived event handlers", () => {
    generateTestCases(
      (eventHandler) =>
        new Machine(
          { handlers: { a: [eventHandler] } },
          {},
          (state, eventName) => state.handlers?.[eventName]
        )
    );
  });
});

function generateTestCases(
  createMachine: (
    eventHandler: AnyMachineEventHandler<Context>
  ) => Machine<Context>
) {
  it("reacts to the correct events", () => {
    const fn = jest.fn();
    const runtime = createMachine(fn);
    runtime.events.b();
    expect(fn).not.toHaveBeenCalled();
    runtime.events.a();
    expect(fn).toHaveBeenCalled();
  });

  it("can receive state", () => {
    let receivedState: unknown;
    const runtime = createMachine((state) => {
      receivedState = original(state);
    });
    const startState = runtime.state;
    runtime.events.a();
    expect(receivedState).toEqual(startState);
  });

  it("can receive input", () => {
    let receivedInput: number | undefined;
    const runtime = createMachine((state, input) => {
      receivedInput = input;
    });
    runtime.events.a(123);
    expect(receivedInput).toBe(123);
  });

  it("can update state", () => {
    const runtime = createMachine((state) => {
      state.value = "Updated";
    });
    runtime.events.a();
    expect(runtime.state.value).toBe("Updated");
  });

  it("updates does not mutate current state", () => {
    const runtime = createMachine((state) => {
      state.value = "Updated";
    });
    const stateBeforeEvent = runtime.state;
    runtime.events.a();
    expect(runtime.state.value).toBe("Updated");
    expect(stateBeforeEvent.value).not.toBe("Updated");
  });
}

type Context = MachineContext<State, Events>;

interface State {
  value?: unknown;
  handlers?: MachineEventHandlerCollection<Context>;
}

type Events = {
  a: (n?: number) => void;
  b: () => void;
};
