import type { MachineActions } from "./MachineAction";

export type MachineContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Actions extends MachineActions = any
> = {
  state: State;
  actions: Actions;
};
