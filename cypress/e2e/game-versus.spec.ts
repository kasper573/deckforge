import { resetData } from "../support/actions/common";
import type { TestUser } from "../support/actions/user";
import { nextTestUser, register } from "../support/actions/user";
import { gamePageActions, setupGameTests } from "../support/actions/game";

describe("game: versus", () => {
  let user: TestUser;
  before(() => {
    resetData("user");
    cy.visit("/");
    user = nextTestUser();
    register(user.name, user.password, user.email);
  });

  const gameName = "New game";
  setupGameTests("1 vs 1", gameName, () => {
    it("can play through default game", () => {
      gamePageActions.list.gotoGamePlay(gameName);

      cy.findByRole("button", { name: /start game/i }).click();

      turn(playFire);
      turn();
      turn(playFire);
      turn();
      turn(playFire);
      turn();
      playFire();

      cy.findByText("Player 1 won!");
    });
  });
});

function playFire() {
  cy.findAllByText(/fire/i).eq(0).click();
}

function turn(fn = () => {}) {
  fn();
  cy.findByRole("button", { name: /end turn/i }).click();
}
