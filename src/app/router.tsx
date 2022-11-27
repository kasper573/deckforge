import { OptionsRouter, stringParser } from "react-typesafe-routes";
import HomePage from "./pages/HomePage";
import GamePlayPage from "./pages/GamePlayPage";
import BuildPage from "./pages/BuildPage";
import GameEditPage from "./pages/GameEditPage";
import DeckListPage from "./pages/DeckListPage";
import DeckEditPage from "./pages/DeckEditPage";
import CardEditPage from "./pages/CardEditPage";
import EntityListPage from "./pages/EntityListPage";
import EntityEditPage from "./pages/EntityEditPage";
import EventsPage from "./pages/EventsPage";

export const router = OptionsRouter({}, (route) => ({
  home: route("", {
    exact: true,
    component: HomePage,
  }),
  play: route("play/:gameId", {
    component: GamePlayPage,
    params: {
      gameId: stringParser,
    },
  }),
  build: route("build", { component: BuildPage }, (route) => ({
    game: route(
      ":gameId",
      {
        component: GameEditPage,
        params: { gameId: stringParser },
      },
      (route) => ({
        deck: route("deck", { component: DeckListPage }, (route) => ({
          edit: route(
            ":deckId",
            {
              component: DeckEditPage,
              params: { deckId: stringParser },
            },
            (route) => ({
              card: route(":cardId", {
                component: CardEditPage,
                params: { cardId: stringParser },
              }),
            })
          ),
        })),
        entity: route("entity", { component: EntityListPage }, (route) => ({
          edit: route(":entityId", {
            component: EntityEditPage,
            params: { entityId: stringParser },
          }),
        })),
        events: route("events", { component: EventsPage }),
      })
    ),
  })),
}));
