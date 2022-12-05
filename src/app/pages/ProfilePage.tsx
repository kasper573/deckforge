import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Page } from "../layout/Page";
import { useForm } from "../hooks/useForm";
import { updateProfilePayloadType } from "../../api/services/user/types";
import { trpc } from "../trpc";
import { Center } from "../components/Center";
import { Header } from "../layout/Header";
import { ProgressButton } from "../components/ProgressButton";
import { useModal } from "../../lib/useModal";
import { Toast } from "../components/Toast";

export default function ProfilePage() {
  const { data: defaultValues } = trpc.user.profile.useQuery();
  const form = useForm(updateProfilePayloadType, { defaultValues });
  const updateProfile = trpc.user.updateProfile.useMutation();
  const showToast = useModal(Toast);
  const { submit, error } = form.useMutation(updateProfile, {
    onSuccess: () => showToast({ content: "Profile updated!" }),
  });

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
                <ProgressButton
                  isLoading={updateProfile.isLoading}
                  type="submit"
                  variant="contained"
                >
                  Save
                </ProgressButton>
              </div>
            </Stack>
          </Stack>
        </form>
      </Center>
    </Page>
  );
}
