export function resetData(modelName?: string) {
  cy.exec(`yarn db:reset` + (modelName ? ` ${modelName}` : ""));
}

export function waitForPageLoad() {
  cy.waitForNetworkIdle(200);
  cy.findByRole("progressbar").should("not.exist");
}

export type ElementFilter =
  | RegExp
  | string
  | ((accessibleName: string, element: Element) => boolean);
