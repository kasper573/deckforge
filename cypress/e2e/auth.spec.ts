describe("auth", () => {
  it("becomes signed in after clicking sign in", () => {
    cy.visit("/");
    cy.findByRole("button", { name: "show user menu" }).click();
    cy.findByRole("button", { name: "sign in" }).click();
    cy.findByTestId("online-indicator").should("exist");
  });
});
