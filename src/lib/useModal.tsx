import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useCallback, useEffect, useMemo } from "react";
import { enableMapSet } from "immer";

enableMapSet();

export interface ModalProps<Output = void, Input = void>
  extends ExposedModalState<Input> {
  resolve: (output: Output) => void;
}

interface ExposedModalState<Input> {
  open: boolean;
  input: Input;
}

type ModalComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input = any
> = (props: ModalProps<Output, Input>) => JSX.Element;

export function useModal<Output, Input>(
  component: ModalComponent<Output, Input>,
  fixedId?: ModalId
) {
  const id = useMemo(() => fixedId ?? createModalId(), [fixedId]);

  useEffect(() => {
    store.getState().upsertModal({ id, component });
    return () => store.getState().removeModal(id);
  }, [id, component]);

  useEffect(() => () => store.getState().removeModal(id), [id]);

  const openModal = useCallback(
    function (input: Input): Promise<Output> {
      return store.getState().openModal(id, input);
    },
    [id]
  );

  return openModal;
}

type ModalId = number;

type ModalInput<T extends AnyModal> = T extends Modal<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  infer Input
>
  ? Input
  : never;

type ModalOutput<T extends AnyModal> = T extends Modal<
  infer Output,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>
  ? Output
  : never;

interface Modal<Output, Input> extends ExposedModalState<Input> {
  id: ModalId;
  component: ModalComponent<Output, Input>;
  promise?: Promise<Output>;
  resolver?: (output: Output) => void;
  hasInput?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModal = Modal<any, any>;

type UpsertModalPayload = Omit<
  AnyModal,
  "promise" | "resolver" | keyof ExposedModalState<unknown>
>;

interface ModalStore {
  modals: Map<ModalId, AnyModal>;
  upsertModal: (modal: UpsertModalPayload) => void;
  openModal: <T extends AnyModal>(
    id: ModalId,
    input: ModalInput<T>
  ) => Promise<ModalOutput<T>>;
  resolveModal: <T extends AnyModal>(
    id: ModalId,
    output: ModalOutput<T>
  ) => void;
  removeModal: (id: ModalId) => void;
}

const store = createStore<ModalStore>()(
  immer((set) => ({
    modals: new Map(),
    upsertModal(modal) {
      set((state) => {
        const existing = state.modals.get(modal.id);
        if (!existing) {
          state.modals.set(modal.id, {
            ...modal,
            open: false,
            input: undefined,
          });
        } else {
          Object.assign(existing, modal);
        }
      });
    },
    openModal<T extends AnyModal>(id: ModalId, input: ModalInput<T>) {
      let resolver: (value: ModalOutput<T>) => void;
      const promise = new Promise<ModalOutput<T>>((r) => (resolver = r));
      set((state) => {
        const modal = state.modals.get(id);
        if (!modal) {
          throw new Error(`Modal with id ${id} does not exist`);
        }
        modal.input = input;
        modal.open = true;
        modal.promise = promise;
        modal.resolver = resolver as typeof modal.resolver;
        modal.hasInput = true;
      });
      return promise;
    },
    resolveModal(id, value) {
      set((state) => {
        const modal = state.modals.get(id);
        if (!modal) {
          throw new Error(`Modal with id ${id} does not exist`);
        }
        if (!modal.resolver) {
          throw new Error(`Modal with id ${id} has no resolver`);
        }
        modal.open = false;
        modal.resolver(value);
        modal.resolver = undefined;
        modal.promise = undefined;
      });
    },
    removeModal(id) {
      set((state) => {
        state.modals.delete(id);
      });
    },
  }))
);

let idCounter = 0;
export function createModalId(): ModalId {
  return idCounter++;
}

export function ModalOutlet() {
  const { modals, resolveModal } = useStore(store);
  const modalsWithInput = useMemo(
    () => Array.from(modals.values()).filter((m) => m.hasInput),
    [modals]
  );
  return (
    <>
      {modalsWithInput.map((modal) => {
        const { component: Modal } = modal;
        return (
          <Modal
            key={modal.id}
            open={modal.open}
            input={modal.input}
            resolve={(output) => resolveModal(modal.id, output)}
          />
        );
      })}
    </>
  );
}
