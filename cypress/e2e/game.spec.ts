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
    createGame("New game");
    findGameItem("New game").should("exist");
  });

  it("can rename a game ", () => {});

  it("can delete a game", () => {
    createGame("To be deleted");
    clickGameAction("To be deleted", /delete/i);
    cy.findByRole("dialog").within(() =>
      cy.findByRole("button", { name: /yes/i }).click()
    );
    findGameItem("To be deleted").should("not.exist");
  });
});

function findGameList() {
  return cy.findByRole("list", { name: /games/i });
}

function findGameItem(name: string) {
  return findGameList().findByRole("listitem", { name });
}

function clickGameAction(gameName: string, actionName: RegExp) {
  findGameItem("To be deleted").within(() =>
    cy.findByRole("button", { name: actionName }).click()
  );
}

function createGame(name: string) {
  cy.findByRole("button", { name: /new game/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
