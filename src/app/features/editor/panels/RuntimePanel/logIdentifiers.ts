import { cloneDeep } from "lodash";
import { LogIdentifier } from "../../../log/types";
import { colors } from "../../../log/colors";

export const logIdentifiers = {
  event: LogIdentifier.create(`[Event]`, { color: "#0c9d5b" }),
  reducer: LogIdentifier.create(`[Reducer]`, { color: "#aa3fd0" }),
  card: LogIdentifier.create(`[Card]`, { color: "#a99326" }),
  errors: {
    runtime: LogIdentifier.create(`[Runtime Error]`, {
      color: colors.error,
    }),
    compiler: LogIdentifier.create(`[Compiler Error]`, {
      color: colors.error,
    }),
  },
  variable: (name: string, state: unknown) =>
    LogIdentifier.create(cloneDeep(state), {
      text: name,
      highlight: true,
    }),
};
