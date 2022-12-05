import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import { createGame, gotoGame, gotoGameList } from "../support/actions/game";
import { createDeck, gotoDeck, gotoDeckList } from "../support/actions/deck";

const gameName = "Test Game";
const deckName = "Test Deck";

before(() => {
  cy.visit("/");
  resetData("user");
  register("cardTester", "foobarfoobar", "card@testers.com");
  gotoGameList();
  createGame(gameName);
  gotoDeckList(gameName);
  createDeck(deckName);
});

beforeEach(() => {
  resetData("card");
  gotoCardList();
});

describe("card", () => {
  it("card list should be empty for new cards", () => {
    findCardList().findAllByRole("listitem").should("have.length", 0);
  });

  it("can create a new card", () => {
    createCard("New card");
    findCardItem("New card").should("exist");
  });

  it("can rename a card", () => {
    createCard("To be renamed");
    clickCardAction("To be renamed", /edit/i);
    cy.findByRole("textbox", { name: /card name/i })
      .clear()
      .type("Renamed");
    gotoGame(gameName);
    gotoCardList();
    findCardItem("Renamed").should("exist");
  });

  it("can delete a card", () => {
    createCard("To be deleted");
    clickCardAction("To be deleted", /delete/i);
    cy.findByRole("dialog").within(() =>
      cy.findByRole("button", { name: /yes/i }).click()
    );
    findCardItem("To be deleted").should("not.exist");
  });
});

function gotoCardList() {
  gotoDeck(gameName, deckName);
}

function findCardList() {
  return cy.findByRole("list", { name: /cards/i });
}

function findCardItem(name: string) {
  return findCardList().findByRole("listitem", { name });
}

function clickCardAction(cardName: string, actionName: RegExp) {
  findCardItem(cardName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

function createCard(name: string) {
  cy.findByRole("button", { name: /new card/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
