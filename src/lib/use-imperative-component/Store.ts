import produce from "immer";
import type { DeepReadonly } from "./DeepReadonly";

export class Store<State = unknown> {
  private _listeners = new Set<StoreListener<State>>();

  get state(): DeepReadonly<State> {
    return this._state;
  }

  constructor(private _state: State) {}

  mutate(mutator: (currentState: State) => void | State) {
    const previousState = this._state;
    const updatedState = produce(this._state, mutator);
    this._state = updatedState;
    for (const listener of this._listeners) {
      listener(updatedState, previousState);
    }
  }

  subscribe(listener: StoreListener<State>): StoreUnsubscriber {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }
}

export type StoreUnsubscriber = () => void;

export type StoreListener<State> = (
  updatedState: State,
  previousState: State
) => void;