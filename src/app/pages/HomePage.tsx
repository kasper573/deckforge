import { Page } from "../layout/Page";
import { trpc } from "../trpc";
import { Header } from "../layout/Header";
import { useAuth } from "../features/auth/store";

export default function HomePage() {
  const { user } = useAuth();
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
