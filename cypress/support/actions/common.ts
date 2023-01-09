export function resetData(modelName?: string) {
  cy.exec(`yarn db:reset` + (modelName ? ` ${modelName}` : ""));
}

export function expectPageChange(trigger: () => void) {
  cy.location().then((currentLocation) => {
    trigger();
    cy.location().should("not.eq", currentLocation);
    cy.waitForNetworkIdle(500);
    cy.findByRole("progressbar").should("not.exist", {
      timeout: 10000,
    });
  });
}

export type ElementFilter =
  | RegExp
  | string
  | ((accessibleName: string, element: Element) => boolean);
