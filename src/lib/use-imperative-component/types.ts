import type { ComponentProps, ComponentType, Context } from "react";
import type { ComponentStore } from "./ComponentStore";

export type ComponentStoreState = Record<ComponentId, ComponentEntry>;

export type InstanceInterfaceFor<G extends ComponentGenerics> = (
  props: InstanceProps<G>
) => Promise<inferResolutionValue<G["Component"]>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponentType = ComponentType<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ImperativeComponentProps<ResolutionValue = any> = {
  state: InstanceState<ResolutionValue>;
  resolve: (value: ResolutionValue, removeDelay?: Promise<unknown>) => void;
};

export interface ComponentGenerics<
  Component extends ComponentType = ComponentType,
  // eslint-disable-next-line @typescript-eslint/ban-types
  DefaultProps extends Partial<ComponentProps<Component>> = {}
> {
  Component: Component;
  DefaultProps: DefaultProps;
}

export type inferResolutionValue<T extends ComponentType> =
  ComponentProps<T> extends ImperativeComponentProps<infer V> ? V : never;

export type ComponentId = string;
export interface ComponentEntry<
  G extends ComponentGenerics = ComponentGenerics
> {
  component: ComponentType<ImperativeComponentProps>;
  defaultProps?: G["DefaultProps"];
  instances: Record<InstanceId, InstanceEntry<G>>;
  markedForRemoval?: boolean;
}

export type InstanceId = string;

export interface InstanceEntry<G extends ComponentGenerics = ComponentGenerics>
  extends ImperativeComponentProps<inferResolutionValue<G["Component"]>> {
  props: InstanceProps<G>;
}

export type InstanceProps<G extends ComponentGenerics> =
  MakeOptionalIfEmptyObject<
    Omit<
      MakePartial<ComponentProps<G["Component"]>, keyof G["DefaultProps"]>,
      keyof ImperativeComponentProps
    >
  >;

export type InstanceState<ResolutionValue = unknown> =
  | { type: "pending" }
  | { type: "resolved"; value: ResolutionValue };

export interface Imperative {
  useComponent<
    Component extends AnyComponentType,
    DefaultProps extends Partial<ComponentProps<Component>>
  >(
    component: Component,
    defaultProps?: DefaultProps,
    fixedId?: ComponentId
  ): InstanceInterfaceFor<ComponentGenerics<Component, DefaultProps>>;
  Outlet: ComponentType;
  Context: Context<ComponentStore>;
}

export type OutletRenderer = ComponentType<ComponentStoreState>;

// Generic type helpers
type MakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type ExtractRequired<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]-?: T[K];
};
type MakeOptionalIfEmptyObject<T> = ExtractRequired<T> extends Record<
  string,
  never
>
  ? void | undefined | T
  : T;
