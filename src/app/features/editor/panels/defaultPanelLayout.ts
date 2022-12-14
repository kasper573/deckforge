import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "../types";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  direction: "row",
  first: {
    direction: "row",
    first: {
      direction: "column",
      first: "events",
      second: {
        direction: "column",
        first: "cardProperties",
        second: "playerProperties",
        splitPercentage: 50,
      },
      splitPercentage: 40,
    },
    second: "code",
    splitPercentage: 30,
  },
  second: {
    first: "runtime",
    second: {
      first: "inspector",
      second: "decks",
      direction: "column",
      splitPercentage: 40,
    },
    direction: "column",
    splitPercentage: 40,
  },
  splitPercentage: 70,
};
