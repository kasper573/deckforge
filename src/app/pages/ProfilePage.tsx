import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Page } from "../layout/Page";
import { useForm } from "../hooks/useForm";
import { updateProfilePayloadType } from "../../api/services/user/types";
import { trpc } from "../trpc";
import { Center } from "../components/Center";
import { Header } from "../layout/Header";

export default function ProfilePage() {
  const { data: defaultValues } = trpc.user.profile.useQuery();
  const form = useForm(updateProfilePayloadType, { defaultValues });
  const updateProfile = trpc.user.updateProfile.useMutation();
  const { submit, error } = form.useMutation(updateProfile);

  return (
    <Page>
      <Header>Profile</Header>
      <Center>
        <form name="profile" onSubmit={submit}>
          <Stack direction="column" spacing={2} sx={{ width: 350 }}>
            <TextField {...form.register("email")} size="small" label="Email" />
            <TextField
              {...form.register("password")}
              size="small"
              type="password"
              label="New password"
            />
            <TextField
              {...form.register("passwordConfirm")}
              size="small"
              type="password"
              label="New password (confirm)"
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="error" sx={{ flex: 1 }}>
                {error}
              </Typography>
              <div>
                <Button type="submit" variant="contained">
                  Save
                </Button>
              </div>
            </Stack>
          </Stack>
        </form>
      </Center>
    </Page>
  );
}
