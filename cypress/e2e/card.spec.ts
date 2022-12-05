import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import { createGame, gotoGame, gotoGameList } from "../support/actions/game";
import { createDeck, gotoDeckList } from "../support/actions/deck";
import {
  clickCardAction,
  createCard,
  findCardItem,
  findCardList,
  gotoCardList,
} from "../support/actions/card";

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
  gotoCardList(gameName, deckName);
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
    gotoCardList(gameName, deckName);
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
