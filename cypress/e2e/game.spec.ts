import { clickMainMenuOption, resetData, signIn } from "../support/actions";

beforeEach(() => {
  resetData();
  cy.visit("/");
  signIn();
  clickMainMenuOption(/build/i);
});

describe("game", () => {
  it("game list should be empty for new accounts", () => {
    findGameList().findAllByRole("listitem").should("have.length", 0);
  });

  it("can create a new game", () => {
    cy.findByRole("button", { name: /new game/i }).click();
    cy.findByRole("dialog").within(() => {
      cy.findByRole("textbox", { name: /name/i }).type("My Game");
      cy.find("form").submit();
    });
    findGameList().findByRole("listitem", { name: "My Game" }).should("exist");
  });

  it("can rename a game ", () => {});

  it("can delete a game", () => {});
});

function findGameList() {
  return cy.findByRole("list", { name: /games/i });
}
