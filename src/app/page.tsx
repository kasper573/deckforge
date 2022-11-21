"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "./trpcClient";
import styles from "./page.module.css";

export default function HomePage() {
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

  return (
    <div className={styles.containerOuter}>
      <div className={styles.containerInner}>
        <h1 className={styles.title}>
          Deck <span className={styles.titlePink}>Forge</span>
        </h1>
        <div className={styles.helloFrom}>
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading...</p>}
        </div>
        <AuthShowcase />
      </div>
    </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className={styles.authShowcase}>
      {sessionData && (
        <p>
          Logged in as {sessionData?.user?.name}{" "}
          {sessionData?.user?.role
            ? `(role: ${sessionData?.user?.role})`
            : undefined}
        </p>
      )}
      {secretMessage && <p>{secretMessage}</p>}
      <button
        className={styles.signInButton}
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
