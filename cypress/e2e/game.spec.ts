import { expectRedirect, resetData } from "../support/actions/common";
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
    const gameName = "New game";

    beforeEach(() => {
      cy.findByRole("button", { name: /create game/i }).click();
      cy.findByRole("dialog").within(() => cy.findByText(/1 vs 1/i).click());

      expectRedirect(() => {
        cy.findByRole("dialog").within(() => {
          cy.findByLabelText(/name/i).type(gameName);
          cy.findByRole("form").submit();
        });
      });

      cy.findByRole("dialog").within(() => {
        cy.findByText(/welcome to deck forge/i);
        cy.findByRole("button", { name: /no thanks/i }).click();
      });

      gotoGameList();
    });

    it("and see it listed", () => {
      findGameCard(gameName).should("exist");
    });

    it("and rename it", () => {
      showGameOptions(gameName);
      cy.findByRole("menuitem", { name: /rename/i }).click();
      cy.findByRole("dialog").within(() => {
        cy.findByLabelText(/name/i).clear().type("Renamed");
        cy.findByRole("form").submit();
      });
      findGameCard("Renamed").should("exist");
    });

    it("and then delete it", () => {
      showGameOptions(gameName);
      cy.findByRole("menuitem", { name: /delete/i }).click();
      cy.findByRole("dialog").within(() =>
        cy.findByRole("button", { name: /yes/i }).click()
      );
      findGameCard(gameName).should("not.exist");
    });

    it("and visit its gameplay page", () => {
      showGameOptions(gameName);
      expectRedirect(() => cy.findByRole("link", { name: /play/i }).click());
      cy.findByText(/game not found/i).should("not.exist");
    });
  });
});

const gotoGameList = () => showUserMenu().findByText("Your games").click();

const findGameCard = (name: string) => cy.findByRole("link", { name });

const showGameOptions = (gameName: string) =>
  findGameCard(gameName).within(() => {
    cy.findByRole("button", { name: /more options/i }).click();
  });
