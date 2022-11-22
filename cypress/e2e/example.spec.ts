describe("example", () => {
  it("can see home page text", () => {
    cy.visit("/");
    cy.contains("Home");
  });
});
