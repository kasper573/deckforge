import { OptionsRouter, stringParser } from "react-typesafe-routes";
import { lazy } from "react";
import { createAccessFactory } from "./middlewares/access";
import { NotPermittedPage } from "./pages/NotPermittedPage";
import { NotAuthenticatedPage } from "./pages/NotAuthenticatedPage";
import { LoadingPage } from "./pages/LoadingPage";

const access = createAccessFactory({
  NotPermittedPage,
  NotAuthenticatedPage,
  LoadingPage,
});

export const router = OptionsRouter({}, (route) => ({
  home: route("", {
    exact: true,
    component: lazy(() => import("./pages/HomePage")),
  }),
  play: route(
    "play",
    { component: lazy(() => import("./pages/GameBrowsePage")) },
    (route) => ({
      game: route(":gameId", {
        component: lazy(() => import("./pages/GamePlayPage")),
        params: {
          gameId: stringParser,
        },
      }),
    })
  ),
  build: route(
    "build",
    {
      middleware: access("User"),
      component: lazy(() => import("./pages/BuildPage")),
    },
    (route) => ({
      game: route(
        ":gameId",
        {
          component: lazy(() => import("./pages/GameEditPage")),
          params: { gameId: stringParser },
        },
        (route) => ({
          deck: route(
            "deck",
            {
              component: lazy(() => import("./pages/DeckListPage")),
            },
            (route) => ({
              edit: route(
                ":deckId",
                {
                  component: lazy(() => import("./pages/DeckEditPage")),
                  params: { deckId: stringParser },
                },
                (route) => ({
                  card: route(":cardId", {
                    component: lazy(() => import("./pages/CardEditPage")),
                    params: { cardId: stringParser },
                  }),
                })
              ),
            })
          ),
          entity: route(
            "entity",
            {
              component: lazy(() => import("./pages/EntityListPage")),
            },
            (route) => ({
              edit: route(":entityId", {
                component: lazy(() => import("./pages/EntityEditPage")),
                params: { entityId: stringParser },
              }),
            })
          ),
          events: route("events", {
            component: lazy(() => import("./pages/EventsPage")),
          }),
        })
      ),
    })
  ),
}));
