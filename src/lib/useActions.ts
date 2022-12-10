import { useDispatch } from "react-redux";
import type { ActionCreatorsMapObject, Dispatch } from "redux";
import { useMemo } from "react";

export function useActions<T extends ActionCreatorsMapObject>(
  actionCreators: T
): T {
  const dispatch = useDispatch();
  return useMemo(
    () => createActionDispatchers(actionCreators, dispatch),
    [actionCreators, dispatch]
  );
}

function createActionDispatchers<T extends ActionCreatorsMapObject>(
  actionCreators: T,
  dispatch: Dispatch
): T {
  return Object.keys(actionCreators).reduce(
    <K extends keyof T>(dispatchers: T, key: K) => {
      const actionCreator = actionCreators[key];
      function dispatcher(...args: Parameters<T[K]>) {
        const action = actionCreator(...args);
        dispatch(action);
        return action;
      }
      dispatchers[key] = dispatcher as T[K];
      return dispatchers;
    },
    {} as T
  );
}
