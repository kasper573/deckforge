import { resetData } from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import { nextTestUser, register } from "../support/actions/user";
import {
  findGameCard,
  gotoGameEditor,
  gamePageActions,
  showGameOptions,
  setupGameTests,
} from "../support/actions/game";

describe("game", () => {
  let user: TestUser;
  before(() => {
    resetData("user");
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  const gameName = "New game";
  setupGameTests("1 vs 1", gameName, () => {
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
