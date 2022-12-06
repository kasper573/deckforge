import { resetData } from "../support/actions/common";
import { register } from "../support/actions/user";
import { createGame, gotoGame, gotoGameList } from "../support/actions/game";
import {
  clickEntityPropertyAction,
  createEntityProperty,
  findEntityPropertyItem,
  findEntityPropertyList,
  gotoEntityEdit,
  submitEntityPropertyForm,
} from "../support/actions/entity";

const gameName = "Entity Test Game";
before(() => {
  cy.visit("/");
  resetData("user");
  register("entityTester", "foobarfoobar", "entity@testers.com");
  gotoGameList();
  createGame(gameName);
});

for (const entityId of ["player", "card"]) {
  describe(`entity: ${entityId}`, () => {
    beforeEach(() => {
      resetData("property");
      gotoEntityEdit(gameName, entityId);
    });

    it("property list should be empty by default", () => {
      findEntityPropertyList()
        .findAllByRole("listitem")
        .should("have.length", 0);
    });

    it("can create a new property", () => {
      createEntityProperty("New entity");
      findEntityPropertyItem("New entity").should("exist");
    });

    it("can edit a property", () => {
      createEntityProperty("To be renamed", "number");
      clickEntityPropertyAction("To be renamed", /edit/i);
      submitEntityPropertyForm("Renamed property", "string");
      gotoGame(gameName);
      gotoEntityEdit(gameName, entityId);
      findEntityPropertyItem("Renamed property").should("exist");
    });

    it("can delete a property", () => {
      createEntityProperty("To be deleted");
      clickEntityPropertyAction("To be deleted", /delete/i);
      cy.findByRole("dialog").within(() =>
        cy.findByRole("button", { name: /yes/i }).click()
      );
      findEntityPropertyItem("To be deleted").should("not.exist");
    });
  });
}
