import { createElement } from "react";
import { createImperative } from "./use-imperative-component/useImperativeComponent";
import type { ImperativeComponentProps } from "./use-imperative-component/types";

export interface ModalProps<Output = void>
  extends ImperativeComponentProps<Output> {
  resolve: (output: Output) => void;
}

const imperative = createImperative((state) => (
  <>
    {Object.entries(state).flatMap(
      ([componentId, { instances, component, defaultProps }]) =>
        Object.entries(instances).map(
          ([instanceId, { props, state, resolve }]) =>
            createElement(component, {
              key: `${componentId}-${instanceId}`,
              ...defaultProps,
              ...props,
              state,
              resolve,
            })
        )
    )}
  </>
));

export const ModalOutlet = imperative.Outlet;
export const useModal = imperative.useComponent;
