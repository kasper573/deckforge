export function resetData(modelName?: string) {
  cy.exec(`yarn db:reset` + (modelName ? ` ${modelName}` : ""));
}

export function expectRedirect(operation: () => void) {
  cy.url().then((previousUrl) => {
    operation();
    cy.url().should("not.equal", previousUrl);
  });
}

export type ElementFilter =
  | RegExp
  | string
  | ((accessibleName: string, element: Element) => boolean);
