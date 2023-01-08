import {
  resetData,
  waitForPageLoad,
  waitForRedirect,
} from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import { nextTestUser, register, showUserMenu } from "../support/actions/user";

describe("game", () => {
  let user: TestUser;
  before(() => {
    resetData("user");
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  beforeEach(() => {
    resetData("game");
    gotoGameList();
  });

  describe("can create new game", () => {
    const gameName = "Test game";

    beforeEach(() => {
      cy.findByRole("button", { name: /create new game/i }).click();
      cy.findByRole("dialog").within(() => {
        cy.findByLabelText(/game name/i).type(gameName);
        cy.findByRole("form").submit();
        waitForRedirect();
        waitForPageLoad();
      });
    });

    it("and see it listed", () => {
      gotoGameList();
      findGameCard(gameName).should("exist");
    });

    it("and then delete it", () => {
      gotoGameList();
      findGameCard(gameName).within(() => {
        cy.findByRole("button", { name: /more options/i }).click();
      });
      cy.findByRole("menuitem", { name: /delete/i }).click();
      cy.findByRole("dialog").within(() =>
        cy.findByRole("button", { name: /yes/i }).click()
      );
      findGameCard(gameName).should("not.exist");
    });
  });
});

const gotoGameList = () => showUserMenu().findByText("Your games").click();
const findGameCard = (name: string) => cy.findByRole("link", { name });
