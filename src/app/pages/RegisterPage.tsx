import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { FormEvent } from "react";
import { Page } from "../layout/Page";
import { Center } from "../components/Center";
import { trpc } from "../trpc";

export default function RegisterPage() {
  const register = trpc.user.register.useMutation();

  function submit(e: FormEvent) {
    e.preventDefault();
    register.mutate({
      name: "",
      password: "",
      passwordConfirm: "",
      email: "",
    });
  }

  return (
    <Page>
      <Center>
        <form onSubmit={submit}>
          <Stack direction="column" spacing={2} sx={{ width: 350 }}>
            <TextField size="small" label="Username" />
            <TextField size="small" label="E-mail" />
            <TextField size="small" type="password" label="Password" />
            <TextField
              size="small"
              type="password"
              label="Password (confirm)"
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="error" sx={{ flex: 1 }}>
                {register.error?.message}
              </Typography>
              <div>
                <Button type="submit" variant="contained">
                  Register
                </Button>
              </div>
            </Stack>
          </Stack>
        </form>
      </Center>
    </Page>
  );
}
