import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme as createMuiTheme } from "@mui/material/styles";

export function createTheme() {
  return createMuiTheme({
    palette: {
      mode: "dark",
    },
  });
}
