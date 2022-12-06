import { gotoGame } from "./game";

export function gotoEntityEdit(gameName: string, entityId: string) {
  gotoGame(gameName);
  cy.findByRole("link", { name: /entities/i }).click();
  cy.findByRole("link", { name: new RegExp(entityId, "i") }).click();
}

export function findEntityPropertyList() {
  return cy.findByRole("list", { name: /properties/i });
}

export function findEntityPropertyItem(name: string) {
  return findEntityPropertyList().findByRole("listitem", { name });
}

export function clickEntityPropertyAction(
  entityName: string,
  actionName: RegExp
) {
  findEntityPropertyItem(entityName).within(() =>
    cy.findByRole(/button|link/, { name: actionName }).click()
  );
}

export function createEntityProperty(name: string, typeName?: string) {
  cy.findByRole("button", { name: /new property/i }).click();
  submitEntityPropertyForm(name, typeName);
}

export function submitEntityPropertyForm(name: string, typeName = "number") {
  cy.findByRole("dialog").within(() => {
    cy.findByRole("textbox", { name: /name/i }).clear().type(name);
    cy.findByLabelText(/type/i).select(typeName);
    cy.findByRole("form").submit();
  });
}
