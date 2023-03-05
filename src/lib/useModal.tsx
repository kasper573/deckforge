import { createElement } from "react";
import { createImperative } from "./use-imperative-component/useImperativeComponent";
import type { ImperativeComponentProps } from "./use-imperative-component/types";

export interface ModalProps<Output = void>
  extends ImperativeComponentProps<Output> {
  resolve: (output: Output) => void;
}

const imperative = createImperative(({ entries }) => (
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
));

export const ModalOutlet = imperative.Outlet;
export const useModal = imperative.useComponent;
