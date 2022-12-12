import { resetData } from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import {
  assertProfile,
  assertSignedIn,
  assertSignedOut,
  gotoProfile,
  nextTestUser,
  register,
  showUserMenu,
  signIn,
  signOut,
  updateProfile,
} from "../support/actions/user";

describe("guest", () => {
  beforeEach(() => cy.visit("/"));

  it("can not see link to build page in menu", () => {
    showUserMenu().should("not.contain", "Your games");
  });

  it("is not given access when attempting to sign in with bogus credentials", () => {
    signIn("bogus", "credentials", { waitForRedirect: false });
    assertSignedOut();
  });
});

describe("user", () => {
  let user: TestUser;
  beforeEach(() => {
    resetData();
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  it("can see link to build page in menu", () => {
    showUserMenu().should("contain", "Your games");
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
    gotoProfile();
    updateProfile({ email: "new@email.com" });
    signOut();
    cy.visit("/"); // Reload to clear any potential form cache
    signIn(user.name, user.password);
    gotoProfile();
    assertProfile({ email: "new@email.com" });
  });

  it("can change their password", () => {
    gotoProfile();
    updateProfile({ password: "my very long new password" });
    signOut();
    signIn(user.name, "my very long new password");
    assertSignedIn(user.name);
  });
});

describe("two different users", () => {
  const user1 = nextTestUser();
  const user2 = nextTestUser();

  before(() => {
    resetData();
    cy.visit("/");
    register(user1.name, user1.password, user1.email);
    signOut();
    register(user2.name, user2.password, user2.email);
    signOut();
  });

  it("gets signed in to the correct account", () => {
    cy.visit("/");
    signIn(user1.name, user1.password);
    assertSignedIn(user1.name);
    signOut();
    signIn(user2.name, user2.password);
    assertSignedIn(user2.name);
  });

  it("can only access their own profile data", () => {
    cy.visit("/");
    signIn(user1.name, user1.password);
    gotoProfile();
    assertProfile({ email: user1.email });
    signOut();
    signIn(user2.name, user2.password);
    gotoProfile();
    assertProfile({ email: user2.email });
  });
});
