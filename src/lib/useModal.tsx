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
      {entries.map(({ component, defaultProps, props, key, resolve }) =>
        createElement(component, {
          key,
          ...defaultProps,
          ...props,
          resolve,
          open: true,
        })
      )}
    </>
  ),
});

export const ModalOutlet = imperative.Outlet;
export const useModal = imperative.useComponent;

useModal.fixed = imperative.useComponent.fixed;
