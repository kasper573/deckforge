import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "../types";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  first: {
    first: "events",
    second: {
      first: {
        first: "middlewares",
        second: "cardProperties",
        direction: "column",
        splitPercentage: 50,
      },
      second: "playerProperties",
      direction: "column",
      splitPercentage: 66,
    },
    direction: "column",
    splitPercentage: 33,
  },
  second: {
    direction: "row",
    first: {
      first: "code",
      second: "logs",
      direction: "column",
      splitPercentage: 55,
    },
    second: {
      direction: "column",
      first: "runtime",
      second: {
        first: "inspector",
        second: "decks",
        direction: "column",
        splitPercentage: 33,
      },
      splitPercentage: 33,
    },
    splitPercentage: 66,
  },
  direction: "row",
  splitPercentage: 20,
};
