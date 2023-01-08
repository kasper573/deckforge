import type { MachineContext } from "./MachineContext";
import type {
  MachineActionObject,
  MachineActionPayload,
} from "./MachineAction";
import type { Machine } from "./Machine";

export function inferFailSafeMachine<MC extends MachineContext>({
  actions,
  ...otherMachineMembers
}: Machine<MC>): FailSafeMachine<MC> {
  const errorSubscriptions = new Set<MachineErrorEventHandler<MC>>();

  const failSafeActions = new Proxy({} as MC["actions"], {
    get:
      (target, prop) =>
      <ActionName extends keyof MC["actions"]>(
        payload: MachineActionPayload<MC["actions"][ActionName]>
      ) => {
        const name = prop as ActionName;
        const actionHandler = actions[name];
        try {
          return actionHandler(payload);
        } catch (error) {
          for (const subscription of errorSubscriptions) {
            subscription({ name, payload }, error);
          }
        }
      },
  });

  function subscribeToErrors(
    errorHandler: MachineErrorEventHandler<MC>
  ): MachineErrorUnsubscriber {
    errorSubscriptions.add(errorHandler);
    return () => {
      errorSubscriptions.delete(errorHandler);
    };
  }

  return {
    ...otherMachineMembers,
    actions: failSafeActions,
    subscribeToErrors,
  };
}

export interface FailSafeMachine<MC extends MachineContext>
  extends Machine<MC> {
  subscribeToErrors: (
    errorHandler: MachineErrorEventHandler<MC>
  ) => MachineErrorUnsubscriber;
}

export type MachineErrorUnsubscriber = () => void;

export type MachineErrorEventHandler<MC extends MachineContext> = (
  action: MachineActionObject<MC>,
  error: unknown
) => void;
