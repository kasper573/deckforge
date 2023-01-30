import { resetData } from "../support/actions/common";
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
      pageActions.list.renameGame(gameName, "Renamed");
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
      pageActions.list.gotoGamePlay(gameName);
    });

    it("rename it and then visit its gameplay page", () => {
      pageActions.list.renameGame(gameName, "Renamed");
      pageActions.list.gotoGamePlay("Renamed");
    });

    it("rename it inside the editor and then visit its gameplay page", () => {
      gotoEditor(gameName);
      pageActions.editor.renameGame("Renamed");
      pageActions.editor.gotoGamePlay();
    });
  });
});

const gotoEditor = (gameName: string) => findGameCard(gameName).click();

const gotoGameList = () => showUserMenu().findByText("Your games").click();

const findGameCard = (name: string) => cy.findByRole("link", { name });

const showGameOptions = (gameName: string) =>
  findGameCard(gameName).within(() => {
    cy.findByRole("button", { name: /more options/i }).click();
  });

const expectValidGamePlayPage = () =>
  cy.findByText(/game not found/i).should("not.exist");

function submitNewNameDialog(newName: string) {
  cy.findByRole("dialog").within(() => {
    cy.findByLabelText(/name/i).clear().type(newName);
    cy.findByRole("form").submit();
  });
}

const pageActions = {
  list: {
    renameGame(gameName: string, newName: string) {
      showGameOptions(gameName);
      cy.findByRole("menuitem", { name: /rename/i }).click();
      submitNewNameDialog(newName);
      findGameCard(newName).should("exist");
    },
    gotoGamePlay(gameName: string) {
      showGameOptions(gameName);
      cy.findByRole("link", { name: /play/i }).click();
      expectValidGamePlayPage();
    },
  },
  editor: {
    renameGame(newName: string) {
      cy.findByLabelText(/rename game/i).click();
      submitNewNameDialog(newName);
    },
    gotoGamePlay() {
      cy.findByRole("link", { name: /gameplay page/i }).click();
      expectValidGamePlayPage();
    },
  },
};
