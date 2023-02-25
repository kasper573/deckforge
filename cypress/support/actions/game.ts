import { showUserMenu } from "./user";
import { resetData } from "./common";

export const gotoGameEditor = (gameName: string) => {
  findGameCard(gameName).click();
  cy.findByRole("progressbar").should("not.exist");
};

export const gotoGameList = () =>
  showUserMenu().findByText("Your games").click();

export const findGameCard = (name: string) => cy.findByRole("link", { name });

export const showGameOptions = (gameName: string) =>
  findGameCard(gameName).within(() => {
    cy.findByRole("button", { name: /more options/i }).click();
  });

export const gamePageActions = {
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

const expectValidGamePlayPage = () =>
  cy.findByText(/game not found/i).should("not.exist");

function submitNewNameDialog(newName: string) {
  cy.findByRole("dialog").within(() => {
    cy.findByLabelText(/name/i).clear().type(newName);
    cy.findByRole("form").submit();
  });
}

export function setupGameTests(
  gameTypeName: string,
  gameName: string,
  setupTests: () => void
) {
  beforeEach(() => {
    resetData("game");
    gotoGameList();
  });

  describe(`can create new "${gameTypeName}" game`, () => {
    beforeEach(() => {
      cy.findByRole("button", { name: /create game/i }).click();
      cy.findByRole("dialog").within(() => cy.findByText(gameTypeName).click());

      cy.findByRole("dialog").within(() => {
        cy.findByLabelText(/name/i).type(gameName);
        cy.findByRole("form").submit();
      });

      cy.findByText(/welcome to deck forge/i);
      cy.findByRole("button", { name: /no thanks/i }).click();

      gotoGameList();
    });

    setupTests();
  });
}
