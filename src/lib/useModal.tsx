import { createElement } from "react";
import { createImperative } from "./use-imperative-component/useImperativeComponent";
import type { ImperativeComponentProps } from "./use-imperative-component/types";

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
              open: state.type === "pending",
              resolve,
            })
        )
    )}
  </>
));

export type ModalProps<Output = void> = Omit<
  ImperativeComponentProps<Output>,
  "state"
> & {
  open: boolean;
};

export const ModalOutlet = imperative.Outlet;
export const useModal = imperative.useComponent;
