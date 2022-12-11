import Typography from "@mui/material/Typography";
import { Page } from "../../../layout/Page";
import { Center } from "../../../components/Center";
import { LinkButton } from "../../../components/Link";
import { router } from "../../../router";

export function NotAuthenticatedPage() {
  return (
    <Page>
      <Center sx={{ textAlign: "center" }}>
        <Typography paragraph>
          You must be signed in to view this page
        </Typography>
        <LinkButton variant="contained" to={router.user().login()}>
          Sign in
        </LinkButton>
      </Center>
    </Page>
  );
}
