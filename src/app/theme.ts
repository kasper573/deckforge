import { Roboto } from "@next/font/google";
import { createTheme as createMuiTheme } from "@mui/material/styles";

export const font = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export function createTheme() {
  return createMuiTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontFamily: font.style.fontFamily,
    },
  });
}
