import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useCallback, useEffect, useMemo } from "react";
import { enableMapSet } from "immer";

enableMapSet();

export interface DialogProps<Output = void, Input = void>
  extends ExposedDialogState<Input> {
  resolve: (output: Output) => void;
}

interface ExposedDialogState<Input> {
  open: boolean;
  input: Input;
}

type DialogComponent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input = any
> = (props: DialogProps<Output, Input>) => JSX.Element;

export function useDialog<Output, Input>(
  component: DialogComponent<Output, Input>
) {
  const id = useMemo(nextId, []);

  useEffect(() => {
    store.getState().upsertDialog({ id, component });
    return () => store.getState().removeDialog(id);
  }, [id, component]);

  useEffect(() => () => store.getState().removeDialog(id), [id]);

  const openDialog = useCallback(
    function (input: Input): Promise<Output> {
      return store.getState().openDialog(id, input);
    },
    [id]
  );

  return openDialog;
}

type DialogId = number;

type DialogInput<T extends AnyDialog> = T extends Dialog<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  infer Input
>
  ? Input
  : never;

type DialogOutput<T extends AnyDialog> = T extends Dialog<
  infer Output,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>
  ? Output
  : never;

interface Dialog<Output, Input> extends ExposedDialogState<Input> {
  id: DialogId;
  component: DialogComponent<Output, Input>;
  promise?: Promise<Output>;
  resolver?: (output: Output) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDialog = Dialog<any, any>;

type UpsertDialogPayload = Omit<
  AnyDialog,
  "promise" | "resolver" | keyof ExposedDialogState<unknown>
>;

interface DialogStore {
  dialogs: Map<DialogId, AnyDialog>;
  upsertDialog: (dialog: UpsertDialogPayload) => void;
  openDialog: <T extends AnyDialog>(
    id: DialogId,
    input: DialogInput<T>
  ) => Promise<DialogOutput<T>>;
  resolveDialog: <T extends AnyDialog>(
    id: DialogId,
    output: DialogOutput<T>
  ) => void;
  removeDialog: (id: DialogId) => void;
}

const store = createStore<DialogStore>()(
  immer((set) => ({
    dialogs: new Map(),
    upsertDialog(dialog) {
      set((state) => {
        const existing = state.dialogs.get(dialog.id);
        if (!existing) {
          state.dialogs.set(dialog.id, {
            ...dialog,
            open: false,
            input: undefined,
          });
        } else {
          Object.assign(existing, dialog);
        }
      });
    },
    openDialog<T extends AnyDialog>(id: DialogId, input: DialogInput<T>) {
      let resolver: (value: DialogOutput<T>) => void;
      const promise = new Promise<DialogOutput<T>>((r) => (resolver = r));
      set((state) => {
        const dialog = state.dialogs.get(id);
        if (!dialog) {
          throw new Error(`Dialog with id ${id} does not exist`);
        }
        dialog.input = input;
        dialog.open = true;
        dialog.promise = promise;
        dialog.resolver = resolver as typeof dialog.resolver;
      });
      return promise;
    },
    resolveDialog(id, value) {
      set((state) => {
        const dialog = state.dialogs.get(id);
        if (!dialog) {
          throw new Error(`Dialog with id ${id} does not exist`);
        }
        if (!dialog.resolver) {
          throw new Error(`Dialog with id ${id} has no resolver`);
        }
        dialog.open = false;
        dialog.resolver(value);
        dialog.resolver = undefined;
        dialog.promise = undefined;
      });
    },
    removeDialog(id) {
      set((state) => {
        state.dialogs.delete(id);
      });
    },
  }))
);

let idCounter = 0;
function nextId() {
  return idCounter++;
}

export function DialogOutlet() {
  const { dialogs, resolveDialog } = useStore(store);
  const dialogsWithInput = useMemo(
    () => Array.from(dialogs.values()).filter((d) => d.open),
    [dialogs]
  );
  return (
    <>
      {dialogsWithInput.map((dialog) => {
        const { component: Dialog } = dialog;
        return (
          <Dialog
            key={dialog.id}
            open={dialog.open}
            input={dialog.input}
            resolve={(output) => resolveDialog(dialog.id, output)}
          />
        );
      })}
    </>
  );
}
