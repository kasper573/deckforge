describe("example", () => {
  it("can get hello from tRPC", () => {
    cy.visit("/");
    cy.contains("Hello from tRPC");
  });
});
