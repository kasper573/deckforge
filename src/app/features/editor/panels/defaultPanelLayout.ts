import type { MosaicNode } from "react-mosaic-component";
import type { PanelId } from "./definition";

export const defaultPanelLayout: MosaicNode<PanelId> = {
  direction: "row",
  first: {
    first: {
      first: "events",
      second: {
        direction: "column",
        first: "cardProperties",
        second: "playerProperties",
        splitPercentage: 50,
      },
      direction: "column",
      splitPercentage: 33,
    },
    second: "code",
    direction: "row",
    splitPercentage: 25,
  },
  second: {
    first: "inspector",
    second: "decks",
    direction: "column",
    splitPercentage: 20,
  },
  splitPercentage: 80,
};
