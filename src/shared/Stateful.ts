import produce from "immer";

export class Stateful<State extends object> {
  private changeListeners: ((state: State) => void)[] = [];

  private _state: State;
  get state() {
    return this._state;
  }

  constructor(initialState: State) {
    this._state = initialState;
  }

  protected setState(changes: Partial<State>) {
    const prevState = this._state;
    this._state = produce(this._state, (draft) => {
      Object.assign(draft, changes);
    });
    if (prevState !== this._state) {
      this.changeListeners.forEach((listener) => listener(this._state));
    }
  }

  subscribe(listener: (state: State) => void) {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index !== -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }
}
