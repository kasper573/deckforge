export function signIn() {
  showUserMenu();
  cy.findByRole(/button|menuitem/, { name: /sign in/i }).click();
  // Sign in flow is handled outside the app. Assumes it's completed (i.e. we've enabled a fake)
}

export function signOut() {
  showUserMenu();
  cy.findByRole(/button|menuitem/, { name: /sign out/i }).click();
}

export function showUserMenu() {
  cy.findByRole("button", { name: /show user menu/i }).click();
}

export function assertSignedIn(shouldBeSignedIn = true) {
  cy.findByTestId("online-indicator").should(
    shouldBeSignedIn ? "exist" : "not.exist"
  );
}
