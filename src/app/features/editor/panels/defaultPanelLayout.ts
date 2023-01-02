import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "../types";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  direction: "row",
  first: {
    direction: "row",
    first: {
      direction: "column",
      first: {
        first: "events",
        second: "middlewares",
        direction: "column",
        splitPercentage: 70,
      },
      second: {
        direction: "column",
        first: "cardProperties",
        second: "playerProperties",
        splitPercentage: 40,
      },
      splitPercentage: 50,
    },
    second: "code",
    splitPercentage: 30,
  },
  second: {
    direction: "column",
    first: "runtime",
    second: {
      direction: "column",
      first: "inspector",
      second: "decks",
      splitPercentage: 40,
    },
    splitPercentage: 40,
  },
  splitPercentage: 66,
};
