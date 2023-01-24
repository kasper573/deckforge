import Typography from "@mui/material/Typography";
import { Page } from "../layout/Page";
import { Center } from "../../components/Center";
import { LinkButton } from "../../components/Link";
import { router } from "../../router";

export default function HomePage() {
  return (
    <Page>
      <Center sx={{ textAlign: "center" }}>
        <Typography variant="h1">Deck Forge</Typography>

        <LinkButton
          sx={{ mt: 2 }}
          variant="outlined"
          to={router.editor({ create: true })}
        >
          Create your own card game
        </LinkButton>
      </Center>
    </Page>
  );
}
