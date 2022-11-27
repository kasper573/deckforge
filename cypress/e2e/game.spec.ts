import { clickMainMenuOption, signIn } from "../support/actions";

beforeEach(() => {
  cy.visit("/");
  signIn();
  clickMainMenuOption(/build/i);
});

describe("game", () => {
  it("can create a new game", () => {});

  it("can rename a game ", () => {});

  it("can delete a game", () => {});
});
