import { findMainMenuOption, resetData } from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import {
  assertSignedIn,
  assertSignedOut,
  nextTestUser,
  register,
  signIn,
  signOut,
  updateProfile,
} from "../support/actions/user";

beforeEach(() => {
  resetData();
  cy.visit("/");
});

describe("guest", () => {
  it("can not see link to build page in menu", () => {
    findMainMenuOption("Admin").should("not.exist");
  });

  it("is not given access when attempting to sign in with bogus credentials", () => {
    signIn("bogus", "credentials", { waitForRedirect: false });
    assertSignedOut();
  });
});

describe("user", () => {
  let user: TestUser;
  beforeEach(() => {
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  it("is signed in after registering", () => {
    assertSignedIn(user.name);
  });

  it("can sign in", () => {
    signOut();
    signIn(user.name, user.password);
    assertSignedIn(user.name);
  });

  it("can change their email", () => {
    updateProfile({ email: "new@email.com" });
    signOut();
    cy.visit("/"); // Reload to clear any potential form cache
    signIn(user.name, user.password);
    cy.findByLabelText("Email").should("have.value", "new@email.com");
  });

  it("can change their password", () => {
    updateProfile({ password: "my very long new password" });
    signOut();
    signIn(user.name, "my very long new password");
    assertSignedIn(user.name);
  });

  describe("gets signed out automatically", () => {
    it("when token expires", () => {
      throw new Error("Not implemented");
    });

    it("when trying to access a restricted page with a valid token but unknown user", () => {
      throw new Error("Not implemented");
    });

    it("when trying to access a restricted page with an invalid token", () => {
      throw new Error("Not implemented");
    });
  });
});
