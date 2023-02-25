import { showUserMenu } from "./user";

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
