describe("auth", () => {
  it("becomes signed in after clicking sign in", () => {
    cy.visit("/");
    cy.findByRole("button", { name: /show user menu/i }).click();
    cy.findByRole(/button|menuitem/, { name: /sign in/i }).click();
    // Sign in flow is handled outside the app. Assumes it's completed (i.e. we've enabled a fake)
    cy.findByTestId("online-indicator").should("exist");
  });
});
