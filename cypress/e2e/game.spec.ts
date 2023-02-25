import { resetData } from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import { nextTestUser, register } from "../support/actions/user";
import {
  findGameCard,
  gotoGameEditor,
  gotoGameList,
  gamePageActions,
  showGameOptions,
} from "../support/actions/game";

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

      cy.findByRole("dialog").within(() => {
        cy.findByLabelText(/name/i).type(gameName);
        cy.findByRole("form").submit();
      });

      cy.findByText(/welcome to deck forge/i);
      cy.findByRole("button", { name: /no thanks/i }).click();

      gotoGameList();
    });

    it("and see it listed", () => {
      findGameCard(gameName).should("exist");
    });

    it("and rename it", () => {
      gamePageActions.list.renameGame(gameName, "Renamed");
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
      gamePageActions.list.gotoGamePlay(gameName);
    });

    it("rename it and then visit its gameplay page", () => {
      gamePageActions.list.renameGame(gameName, "Renamed");
      gamePageActions.list.gotoGamePlay("Renamed");
    });

    it("rename it inside the editor and then visit its gameplay page", () => {
      gotoGameEditor(gameName);
      gamePageActions.editor.renameGame("Renamed");
      gamePageActions.editor.gotoGamePlay();
    });
  });
});
