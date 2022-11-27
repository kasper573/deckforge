import { Page } from "../layout/Page";
import { trpc } from "../trpc";
import { Header } from "../layout/Header";
import { useAuth0 } from "../../shared/auth0/useAuth0";

export default function HomePage() {
  const { user } = useAuth0();
  const { data: publicData = null } = trpc.public.useQuery();
  const { data: privateData = null } = trpc.private.useQuery(undefined, {
    enabled: !!user,
  });
  return (
    <Page>
      <Header>HomePage</Header>
      Response from tRPC:
      <pre>{JSON.stringify({ publicData, privateData }, null, 2)}</pre>
    </Page>
  );
}
