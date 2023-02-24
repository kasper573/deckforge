import { testGameType } from "../testUtils";
import { reactVersus } from "./gameType";

describe("versus", () => {
  it("can play through the default game", () =>
    testGameType(reactVersus, (game) => {}));
});
