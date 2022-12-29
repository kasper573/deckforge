import type { MachineActions } from "./MachineAction";

export type MachineContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  Actions extends MachineActions = MachineActions
> = {
  state: State;
  actions: Actions;
};
