import { gotoGame } from "./game";

export function gotoDeck(gameName: string, deckName: string) {
  gotoDeckList(gameName);
  clickDeckAction(deckName, /edit/i);
}

export function gotoDeckList(gameName: string) {
  gotoGame(gameName);
  cy.findByRole("link", { name: /decks/i }).click();
}

export function findDeckList() {
  return cy.findByRole("list", { name: /decks/i });
}

export function findDeckItem(name: string) {
  return findDeckList().findByRole("listitem", { name });
}

export function clickDeckAction(deckName: string, actionName: RegExp) {
  findDeckItem(deckName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

export function createDeck(name: string) {
  cy.findByRole("button", { name: /new deck/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
