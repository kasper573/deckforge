import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Page } from "../layout/Page";
import { useAuth0 } from "../../lib/auth0/useAuth0";
import { Center } from "../components/Center";

export function NotAuthenticatedPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Page>
      <Center sx={{ textAlign: "center" }}>
        <Typography paragraph>
          You must be signed in to view this page
        </Typography>
        <Button variant="contained" onClick={() => loginWithRedirect()}>
          Sign in
        </Button>
      </Center>
    </Page>
  );
}
