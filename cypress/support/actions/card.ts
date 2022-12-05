import { gotoDeck } from "./deck";

export function gotoCardList(gameName: string, deckName: string) {
  gotoDeck(gameName, deckName);
}

export function findCardList() {
  return cy.findByRole("list", { name: /cards/i });
}

export function findCardItem(name: string) {
  return findCardList().findByRole("listitem", { name });
}

export function clickCardAction(cardName: string, actionName: RegExp) {
  findCardItem(cardName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

export function createCard(name: string) {
  cy.findByRole("button", { name: /new card/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
