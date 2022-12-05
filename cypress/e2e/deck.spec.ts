import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import { createAndEditGame } from "../support/actions/game";

before(() => {
  cy.visit("/");
  resetData("user");
  register("deckTester", "foobarfoobar", "deck@testers.com");
});

beforeEach(() => {
  resetData("deck");
  createAndEditGame("Deck Test Game");
  gotoDeckList();
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
    gotoDeckList();
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

function gotoDeckList() {
  cy.findByRole("link", { name: /decks/i }).click();
}

function findDeckList() {
  return cy.findByRole("list", { name: /decks/i });
}

function findDeckItem(name: string) {
  return findDeckList().findByRole("listitem", { name });
}

function clickDeckAction(deckName: string, actionName: RegExp) {
  findDeckItem(deckName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

function createDeck(name: string) {
  cy.findByRole("button", { name: /new deck/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
