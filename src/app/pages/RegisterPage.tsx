import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Page } from "../layout/Page";
import { Center } from "../components/Center";
import { trpc } from "../trpc";
import { userRegisterPayloadType } from "../../api/services/user/types";
import { useForm } from "../hooks/useForm";

export default function RegisterPage() {
  const form = useForm(userRegisterPayloadType);
  const register = trpc.user.register.useMutation();

  return (
    <Page>
      <Center>
        <form onSubmit={form.handleSubmit(register.mutate)}>
          <Stack direction="column" spacing={2} sx={{ width: 350 }}>
            <TextField
              {...form.register("name")}
              size="small"
              label="Username"
            />
            <TextField
              {...form.register("email")}
              size="small"
              label="E-mail"
            />
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
