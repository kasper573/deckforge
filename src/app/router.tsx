import type { RouteMiddleware } from "react-typesafe-routes";
import {
  OptionsRouter,
  stringParser,
  Redirect,
  useRouteParams,
} from "react-typesafe-routes";
import { lazy, useEffect } from "react";
import { literalParser } from "../lib/literalParser";
import type { GameId } from "../api/services/game/types";
import { entityIdType } from "../api/services/game/types";
import { useActions } from "../lib/useActions";
import { createAccessFactory } from "./features/auth/access";
import { NotPermittedPage } from "./pages/NotPermittedPage";
import { NotAuthenticatedPage } from "./pages/NotAuthenticatedPage";
import { trpc } from "./trpc";
import { editorActions } from "./features/editor/editorState";

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
    { component: () => <Redirect to={router.user().profile()} /> },
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
          middleware: selectedGameMiddleware(),
          component: lazy(() => import("./pages/GameEditPage")),
          params: { gameId: literalParser<GameId>() },
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
                params: { entityId: literalParser(entityIdType._def.values) },
              }),
            })
          ),
          events: route("events", {
            component: lazy(() => import("./pages/EventsPage/EventsPage")),
          }),
        })
      ),
    })
  ),
}));

export const logoutRedirect = router.user().login();
export const loginRedirect = router.user().profile();

function selectedGameMiddleware(): RouteMiddleware {
  return (SomeEditorPage) => {
    function GameLoader() {
      const { selectGame } = useActions(editorActions);
      const { gameId } = useRouteParams(router.build().game);
      const { data: game } = trpc.game.read.useQuery(gameId);
      useEffect(() => {
        if (game) {
          selectGame(game);
        }
      }, [game, selectGame]);
      if (!game) {
        return <NotPermittedPage />;
      }
      return <SomeEditorPage />;
    }

    return GameLoader;
  };
}
