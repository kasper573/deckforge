import type { MachineEventRecord } from "./MachineEvent";

export type MachineContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  Events extends MachineEventRecord = MachineEventRecord
> = {
  state: State;
  events: Events;
};
