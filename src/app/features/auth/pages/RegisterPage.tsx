import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Page } from "../../layout/Page";
import { Center } from "../../../components/Center";
import { trpc } from "../../../trpc";
import { registerUserPayloadType } from "../../../../api/services/user/types";
import { useForm } from "../../../hooks/useForm";
import { Header } from "../../layout/Header";
import { useAuth } from "../store";
import { ProgressButton } from "../../../components/ProgressButton";

export default function RegisterPage() {
  const { login } = useAuth();
  const form = useForm(registerUserPayloadType);
  const register = trpc.user.register.useMutation();
  const { submit, error } = form.useMutation(register, {
    onSuccess(res, user) {
      login.mutateAsync({ username: user.name, password: user.password });
    },
  });

  return (
    <Page>
      <Header>Register an account</Header>
      <Center>
        <form name="register" onSubmit={submit}>
          <Stack direction="column" spacing={2} sx={{ width: 350 }}>
            <TextField
              {...form.register("name")}
              size="small"
              label="Username"
            />
            <TextField {...form.register("email")} size="small" label="Email" />
            <TextField
              {...form.register("password")}
              size="small"
              type="password"
              label="Password"
            />
            <TextField
              {...form.register("passwordConfirm")}
              size="small"
              type="password"
              label="Password (confirm)"
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="error" sx={{ flex: 1 }}>
                {error}
              </Typography>
              <div>
                <ProgressButton
                  isLoading={register.isLoading}
                  type="submit"
                  variant="contained"
                >
                  Register
                </ProgressButton>
              </div>
            </Stack>
          </Stack>
        </form>
      </Center>
    </Page>
  );
}
