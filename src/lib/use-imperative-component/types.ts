import type { ComponentProps, ComponentType, Context } from "react";
import type { ComponentStore } from "./ComponentStore";

export type ComponentStoreState = Record<ComponentId, ComponentEntry>;

export type InstanceInterfaceFor<
  ResolutionValue,
  AdditionalComponentProps,
  DefaultProps extends Partial<AdditionalComponentProps>
> = (
  props: InstanceProps<ResolutionValue, AdditionalComponentProps, DefaultProps>
) => Promise<ResolutionValue>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImperativeComponentProps<ResolutionValue = any>
  extends ResolvingComponentProps<ResolutionValue> {
  state: InstanceState<ResolutionValue>;
}

export interface ResolvingComponentProps<ResolutionValue> {
  resolve: (value: ResolutionValue, removeDelay?: Promise<unknown>) => void;
}

export type ComponentId = string;
export interface ComponentEntry {
  component: AnyComponent;
  defaultProps?: Record<string, unknown>;
  instances: Record<InstanceId, InstanceEntry>;
  markedForRemoval?: boolean;
}

export type InstanceId = string;
export interface InstanceEntry extends ImperativeComponentProps {
  props: InstanceProps;
}

export type InstanceProps<
  ResolutionValue = unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
  AdditionalComponentProps = {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  DefaultProps extends Partial<AdditionalComponentProps> = {}
> = MakeOptionalIfEmptyObject<
  Omit<
    PartialByKeys<
      ImperativeComponentProps<ResolutionValue> & AdditionalComponentProps,
      keyof DefaultProps
    >,
    keyof ImperativeComponentProps
  >
>;

export type InstanceState<ResolutionValue = unknown> =
  | { type: "pending" }
  | { type: "resolved"; value: ResolutionValue };

export interface Imperative {
  useComponent<
    Component extends AnyComponent,
    DefaultProps extends Partial<ComponentProps<Component>>
  >(
    component: Component,
    defaultProps?: DefaultProps,
    fixedId?: ComponentId
  ): InstanceInterfaceFor<
    ComponentProps<Component> extends ResolvingComponentProps<infer R>
      ? R
      : never,
    Omit<ComponentProps<Component>, keyof ImperativeComponentProps>,
    DefaultProps
  >;
  Outlet: ComponentType;
  Context: Context<ComponentStore>;
}

export type OutletRenderer = ComponentType<ComponentStoreState>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

// Generic type helpers
type Merge<T> = {
  [K in keyof T]: T[K];
};

type PartialByKeys<T, K extends PropertyKey> = Merge<
  {
    [P in keyof T as P extends K ? P : never]?: T[P];
  } & {
    [P in keyof T as P extends K ? never : P]: T[P];
  }
>;

type ExtractRequired<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]-?: T[K];
};
type MakeOptionalIfEmptyObject<T> = ExtractRequired<T> extends Record<
  string,
  never
>
  ? void | undefined | T
  : T;
