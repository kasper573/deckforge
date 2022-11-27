import { assertSignedIn, signIn, signOut } from "../support/actions";

beforeEach(() => cy.visit("/"));

describe("auth", () => {
  it("becomes signed in after clicking sign in", () => {
    signIn();
    assertSignedIn();
  });

  it("becomes signed out after clicking sign out", () => {
    signIn();
    assertSignedIn();
    signOut();
    assertSignedIn(false);
  });
});
