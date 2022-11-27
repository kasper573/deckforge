import { createContext, useContext, useEffect, useState } from "react";
import type { StatefulAuth0Client } from "./StatefulAuth0Client";

export function useAuth0() {
  const client = useContext(Auth0Context);
  const [state, setState] = useState(client.state);
  useEffect(() => client.subscribe(setState), [client]);

  return { ...state, ...client };
}

export const Auth0Context = createContext<StatefulAuth0Client>(
  new Proxy({} as StatefulAuth0Client, {
    get() {
      throw new Error("Auth0StateContext not initialized");
    },
  })
);
