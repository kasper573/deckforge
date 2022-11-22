import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../app/trpc";

export default function AuthShowcase() {
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Deck Forge</title>
        <meta name="description" content="Deck Builder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Deck Forge</h1>
      <div>{hello.data ? <p>{hello.data.greeting}</p> : <p>Loading...</p>}</div>
      <SessionInfo />
    </>
  );
}

function SessionInfo() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <>
      {sessionData && (
        <p>
          Logged in as {sessionData?.user?.name}{" "}
          {sessionData?.user?.role
            ? `(role: ${sessionData?.user?.role})`
            : undefined}
        </p>
      )}
      {secretMessage && <p>{secretMessage}</p>}
      <button onClick={sessionData ? () => signOut() : () => signIn()}>
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </>
  );
}
