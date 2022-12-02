import { OptionsRouter, stringParser, Redirect } from "react-typesafe-routes";
import { lazy } from "react";
import { createAccessFactory } from "./features/auth/access";
import { NotPermittedPage } from "./pages/NotPermittedPage";
import { NotAuthenticatedPage } from "./pages/NotAuthenticatedPage";

const access = createAccessFactory({
  NotPermittedPage,
  NotAuthenticatedPage,
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
  user: route(
    "user",
    { component: () => <Redirect to={loginRedirect} /> },
    (route) => ({
      register: route("register", {
        component: lazy(() => import("./pages/RegisterPage")),
      }),
      login: route("login", {
        component: lazy(() => import("./pages/LoginPage")),
      }),
      profile: route("profile", {
        middleware: access(),
        component: lazy(() => import("./pages/ProfilePage")),
      }),
    })
  ),
  build: route(
    "build",
    {
      middleware: access(),
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

export const logoutRedirect = router.user().login();
export const loginRedirect = router.user();
