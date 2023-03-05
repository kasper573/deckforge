import produce from "immer";

export class Store<State> {
  private _listeners = new Set<StoreListener<State>>();
  private _currentMutation?: { draft: State };

  get state(): State {
    return this._state;
  }

  constructor(private _state: State) {}

  mutate(mutator: (currentState: State) => unknown): void {
    if (this._currentMutation) {
      mutator(this._currentMutation.draft);
      return;
    }

    const previousState = this._state;
    const updatedState = produce(this._state, (draft: State) => {
      this._currentMutation = { draft };
      mutator(draft);
      this._currentMutation = undefined;
    });

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
