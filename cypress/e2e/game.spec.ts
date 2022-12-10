import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import {
  clickGameAction,
  createGame,
  findGameItem,
  findGameList,
  gotoGameList,
} from "../support/actions/game";

before(() => {
  cy.visit("/");
  resetData("user");
  register("gameTester", "foobarfoobar", "game@testers.com");
});

beforeEach(() => {
  resetData("game");
  gotoGameList();
});

describe("game", () => {
  it("game list should be empty for new accounts", () => {
    findGameList().findAllByRole("listitem").should("have.length", 0);
  });

  it("can create a new game", () => {
    createGame("New game");
    findGameItem("New game").should("exist");
  });

  it("can rename a game", () => {
    createGame("To be renamed");
    clickGameAction("To be renamed", /edit/i);
    cy.findByRole("textbox", { name: /game name/i })
      .clear()
      .type("Renamed");
    gotoGameList();
    findGameItem("Renamed").should("exist");
  });

  it("can delete a game", () => {
    createGame("To be deleted");
    clickGameAction("To be deleted", /delete/i);
    cy.findByRole("dialog").within(() =>
      cy.findByRole("button", { name: /yes/i }).click()
    );
    findGameItem("To be deleted").should("not.exist");
  });
});
