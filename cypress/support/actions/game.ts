import { clickMainMenuOption } from "./common";

export function gotoGameList() {
  clickMainMenuOption(/build/i);
}

export function gotoGame(gameName: string) {
  gotoGameList();
  clickGameAction(gameName, /edit/i);
}

export function findGameList() {
  return cy.findByRole("list", { name: /games/i });
}

export function findGameItem(name: string) {
  return findGameList().findByRole("listitem", { name });
}

export function clickGameAction(gameName: string, actionName: RegExp) {
  findGameItem(gameName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

export function createGame(name: string) {
  cy.findByRole("button", { name: /new game/i }).click();
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).type(name);
    cy.findByRole("form").submit();
  });
}
