import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "../types";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  first: {
    direction: "row",
    first: {
      direction: "row",
      first: {
        direction: "column",
        first: {
          direction: "column",
          first: "events",
          second: "middlewares",
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
      splitPercentage: 33,
    },
    splitPercentage: 66,
  },
  second: "logs",
  direction: "row",
  splitPercentage: 80,
};
