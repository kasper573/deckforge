export function findMainMenuOption(name: ElementFilter) {
  ensureMainMenuVisible();
  return cy
    .findByRole("navigation", { name: /main menu/i })
    .findByRole("link", { name });
}

export function clickMainMenuOption(name: ElementFilter) {
  findMainMenuOption(name).click();
}

function ensureMainMenuVisible() {
  cy.get("body").then(($body) => {
    const [menuTrigger] = $body.find(`button[aria-label="Show main menu"]`);
    if (menuTrigger) {
      menuTrigger.click();
    }
  });
}

export function resetData(modelName?: string) {
  cy.exec(`yarn db:reset` + (modelName ? ` ${modelName}` : ""));
}

export type ElementFilter =
  | RegExp
  | string
  | ((accessibleName: string, element: Element) => boolean);
