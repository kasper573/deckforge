import TextField from "@mui/material/TextField";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Page } from "../layout/Page";
import { Header } from "../layout/Header";
import { Center } from "../components/Center";
import { useAuth } from "../features/auth/store";

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();

    setErrorMessage(undefined);
    const result = await login({
      username: usernameRef.current?.value ?? "",
      password: passwordRef.current?.value ?? "",
    });
    if (!result.success) {
      setErrorMessage(result.message);
    }
  }

  return (
    <Page>
      <Header>Login</Header>
      <Center>
        <form onSubmit={submit}>
          <TextField label="Username" ref={usernameRef} />
          <TextField label="Password" ref={passwordRef} />
          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}
          <Button type="submit">Login</Button>
        </form>
      </Center>
    </Page>
  );
}
