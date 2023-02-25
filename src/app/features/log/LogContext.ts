import { createContext } from "react";
import type { Highlighter } from "../../hooks/useHighlighter";

export const LogContext = createContext({
  highlighter: new Proxy({} as Highlighter<unknown, string>, {
    get() {
      throw new Error("LogContext must be provided a value");
    },
  }),
});
