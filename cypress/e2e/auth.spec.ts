describe("auth", () => {
  it("becomes signed in after clicking sign in", () => {
    cy.visit("/");
    cy.findByRole("button", { name: "show user menu" }).click();
    cy.findByRole("button", { name: "sign in" }).click();
    // Sign in flow is handled outside the app. Assumes it's completed (i.e. we've enabled a fake)
    cy.findByTestId("online-indicator").should("exist");
  });
});
