import { Redirect } from "react-typesafe-routes";
import { router } from "../../router";
import { useAuth } from "../auth/store";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <Redirect
      to={isAuthenticated ? router.user().games() : router.editor({})}
      push={false}
    />
  );
}

// Remove this after implementing landing page
// https://github.com/ksandin/deckforge/issues/58
export const isLandingPageImplementedYet = false;
