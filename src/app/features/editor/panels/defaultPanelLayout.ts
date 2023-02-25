import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "../types";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  direction: "row",
  first: {
    direction: "column",
    first: "events",
    second: {
      direction: "column",
      first: {
        direction: "column",
        first: "reducers",
        second: "cardProperties",
        splitPercentage: 50,
      },
      second: "playerProperties",
      splitPercentage: 66,
    },
    splitPercentage: 33,
  },
  second: {
    direction: "row",
    first: {
      direction: "column",
      first: "code",
      second: "logs",
      splitPercentage: 77.25,
    },
    second: {
      direction: "column",
      first: "runtime",
      second: {
        direction: "column",
        first: "inspector",
        second: "decks",
        splitPercentage: 33,
      },
      splitPercentage: 33,
    },
    splitPercentage: 66,
  },
  splitPercentage: 20,
};
