import type { RouteMiddleware } from "react-typesafe-routes";
import { OptionsRouter, Redirect, useRouteParams } from "react-typesafe-routes";
import { lazy, useEffect } from "react";
import { literalParser } from "../lib/literalParser";
import type { GameId } from "../api/services/game/types";
import { useActions } from "../lib/useActions";
import { createAccessFactory } from "./features/auth/access";
import { NotPermittedPage } from "./pages/NotPermittedPage";
import { NotAuthenticatedPage } from "./features/common/NotAuthenticatedPage";
import { trpc } from "./trpc";
import { editorActions, selectors } from "./features/editor/editorState";
import { useSelector } from "./store";
import { LoadingPage } from "./features/common/LoadingPage";

const access = createAccessFactory({
  NotPermittedPage,
  NotAuthenticatedPage,
});

export const router = OptionsRouter({}, (route) => ({
  home: route("", {
    exact: true,
    component: lazy(() => import("./features/common/HomePage")),
  }),
  play: route(
    "play",
    { component: lazy(() => import("./pages/GameBrowsePage")) },
    (route) => ({
      game: route(":gameId", {
        component: lazy(() => import("./features/play/GamePlayPage")),
        params: {
          gameId: literalParser<GameId>(),
        },
      }),
    })
  ),
  user: route(
    "user",
    { component: () => <Redirect to={router.user().profile()} /> },
    (route) => ({
      register: route("register", {
        component: lazy(() => import("./features/auth/pages/RegisterPage")),
      }),
      login: route("login", {
        component: lazy(() => import("./features/auth/pages/LoginPage")),
      }),
      profile: route("profile", {
        middleware: access(),
        component: lazy(() => import("./features/auth/pages/ProfilePage")),
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
      game: route(":gameId", {
        component: lazy(
          () => import("./features/editor/EditorPage/EditorPage")
        ),
        params: { gameId: literalParser<GameId>() },
      }),
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
      const { data: remoteGame } = trpc.game.read.useQuery(gameId);
      const localGame = useSelector(selectors.game);
      useEffect(() => {
        if (remoteGame) {
          selectGame(remoteGame);
        }
      }, [remoteGame, selectGame]);
      if (localGame.gameId !== remoteGame?.gameId) {
        return <LoadingPage />;
      }
      return <SomeEditorPage />;
    }

    return GameLoader;
  };
}
