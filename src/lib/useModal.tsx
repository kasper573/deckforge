import { createElement } from "react";
import { createImperative } from "./use-imperative-component/useImperativeComponent";

export interface ModalProps<Output = void, Input = void>
  extends ExposedModalState<Input> {
  resolve: (output: Output) => void;
}

interface ExposedModalState<Input> {
  open: boolean;
  input: Input;
}

const imperative = createImperative({
  renderer: ({ entries }) => (
    <>
      {entries.map(
        ({ component, defaultProps, props, key, resolve, reject, input }) =>
          createElement(component, {
            key,
            ...defaultProps,
            ...props,
            input,
            resolve,
            reject,
            open: true,
          })
      )}
    </>
  ),
});

export const ModalOutlet = imperative.Outlet;
export const useModal = (
  ...args: Parameters<typeof imperative.useComponent>
) => {
  const trigger = imperative.useComponent(...args);
  async function patchedTrigger(...args: Parameters<typeof trigger>) {
    const result = await trigger(...args);
    if (result.isOk()) {
      return result.value;
    }
    throw result.error;
  }

  return patchedTrigger;
};

useModal.fixed = imperative.useComponent.fixed;
