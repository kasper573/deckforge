import { original } from "immer";
import { Machine } from "./Machine";
import type { MachineEventHandler } from "./MachineEvent";
import type { MachineContext } from "./MachineContext";

describe("Machine", () => {
  describe("global event handlers", () => {
    it("reacts to the correct events", () => {
      const fn = jest.fn();
      const runtime = new Machine<Context>({}, { a: [fn] });
      runtime.events.b();
      expect(fn).not.toHaveBeenCalled();
      runtime.events.a();
      expect(fn).toHaveBeenCalled();
    });
  });

  describe("dynamic event handlers", () => {
    it("reacts to the correct events", () => {
      const fn = jest.fn();
      const runtime = createMachine({ handlers: { a: fn } });
      runtime.events.b();
      expect(fn).not.toHaveBeenCalled();
      runtime.events.a();
      expect(fn).toHaveBeenCalled();
    });

    it("can receive state", () => {
      let receivedState: unknown;
      const runtime = createMachine({
        handlers: {
          a(state) {
            receivedState = original(state);
          },
        },
      });
      const startState = runtime.state;
      runtime.events.a();
      expect(receivedState).toEqual(startState);
    });

    it("can receive input", () => {
      let receivedInput: number | undefined;
      const runtime = createMachine({
        handlers: {
          a: (state, input) => {
            receivedInput = input;
          },
        },
      });
      runtime.events.a(123);
      expect(receivedInput).toBe(123);
    });

    it("can update state", () => {
      const runtime = createMachine({
        handlers: {
          a(state) {
            state.value = "Updated";
          },
        },
      });
      runtime.events.a();
      expect(runtime.state.value).toBe("Updated");
    });

    it("updates does not mutate current state", () => {
      const runtime = createMachine({
        handlers: {
          a(state) {
            state.value = "Updated";
          },
        },
      });
      const stateBeforeEvent = runtime.state;
      runtime.events.a();
      expect(runtime.state.value).toBe("Updated");
      expect(stateBeforeEvent.value).not.toBe("Updated");
    });
  });
});

function createMachine(state: State) {
  return new Machine<Context>(state, {}, (state, eventName) => {
    const handler = state.handlers?.[eventName];
    return handler ? [handler] : [];
  });
}

type Context = MachineContext<State, Events>;

interface State {
  value?: unknown;
  handlers?: {
    [K in keyof Events]?: MachineEventHandler<State, Events[K]>;
  };
}

type Events = {
  a: (n?: number) => void;
  b: () => void;
};
