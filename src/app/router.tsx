import {
  booleanParser,
  OptionsRouter,
  Redirect,
  stringParser,
} from "react-typesafe-routes";
import type { ComponentType } from "react";
import { lazy } from "react";
import { literalParser } from "../lib/literalParser";
import type { GameId } from "../api/services/game/types";
import { createAccessFactory } from "./features/auth/access";
import { NotPermittedPage } from "./features/auth/pages/NotPermittedPage";
import { NotAuthenticatedPage } from "./features/auth/pages/NotAuthenticatedPage";
import { Logo } from "./features/layout/Logo";

const access = createAccessFactory({
  NotPermittedPage,
  NotAuthenticatedPage,
});

export const router = OptionsRouter(
  {
    globalLoadingIndicator: true,
    appBar: {
      content: Logo as ComponentType,
      container: true,
    },
  },
  (route) => ({
    home: route("", {
      exact: true,
      component: lazy(() => import("./features/common/HomePage")),
    }),
    play: route("play/:slug&:seed?", {
      component: lazy(() => import("./features/play/GamePlayPage")),
      params: { slug: stringParser, seed: stringParser },
    }),
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
    editor: route(
      "editor&:create?",
      {
        params: { create: booleanParser },
        component: lazy(
          () => import("./features/editor/pages/GameListPage/GameListPage")
        ),
      },
      (route) => ({
        edit: route(":gameId", {
          options: {
            globalLoadingIndicator: false,
            appBar: {
              container: false,
              content: lazy(
                () =>
                  import(
                    "./features/editor/components/AppBar/EditorAppBarContent"
                  )
              ),
            },
          },
          component: lazy(
            () => import("./features/editor/pages/EditorPage/EditorPage")
          ),
          params: { gameId: literalParser<GameId>() },
        }),
      })
    ),
    notFound: route("*", {
      component: lazy(() => import("./features/common/NotFoundPage")),
    }),
  })
);

export const logoutRedirect = router.user().login();
export const loginRedirect = router.editor({});
