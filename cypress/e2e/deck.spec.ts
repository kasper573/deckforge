import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import { createGame, gotoGame, gotoGameList } from "../support/actions/game";
import {
  clickDeckAction,
  createDeck,
  findDeckItem,
  findDeckList,
  selectDeckList,
} from "../support/actions/deck";

const gameName = "Deck Test Game";
before(() => {
  cy.visit("/");
  resetData("user");
  register("deckTester", "foobarfoobar", "deck@testers.com");
  gotoGameList();
  createGame(gameName);
});

beforeEach(() => {
  resetData("deck");
  selectDeckList(gameName);
});

describe("deck", () => {
  it("deck list should be empty for new games", () => {
    findDeckList().findAllByRole("listitem").should("have.length", 0);
  });

  it("can create a new deck", () => {
    createDeck("New deck");
    findDeckItem("New deck").should("exist");
  });

  it("can rename a deck", () => {
    createDeck("To be renamed");
    clickDeckAction("To be renamed", /edit/i);
    cy.findByRole("textbox", { name: /deck name/i })
      .clear()
      .type("Renamed");
    gotoGame(gameName);
    selectDeckList(gameName);
    findDeckItem("Renamed").should("exist");
  });

  it("can delete a deck", () => {
    createDeck("To be deleted");
    clickDeckAction("To be deleted", /delete/i);
    cy.findByRole("dialog").within(() =>
      cy.findByRole("button", { name: /yes/i }).click()
    );
    findDeckItem("To be deleted").should("not.exist");
  });
});
