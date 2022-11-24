import type { ReactNode } from "react";
import * as React from "react";
import type { DocumentInitialProps } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import GlobalStyles from "@mui/material/GlobalStyles";
import type { Theme } from "@mui/material";
import createEmotionCache from "../app/createEmotionCache";
import { createTheme, font } from "../app/theme";
import type { MyAppType } from "./_app";

export default class MyDocument extends Document<MyDocumentProps> {
  render() {
    const { muiTheme, emotionStyleTags } = this.props;
    return (
      <Html lang="en" className={font.className}>
        <Head>
          <meta name="theme-color" content={muiTheme.palette.primary.main} />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="emotion-insertion-point" content="" />
          {emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
          {globalStyles}
        </body>
      </Html>
    );
  }
}

const globalStyles = (
  <GlobalStyles
    styles={{
      [`html, body, #__next`]: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },
    }}
  />
);

interface MyDocumentProps extends DocumentInitialProps {
  emotionStyleTags: ReactNode[];
  muiTheme: Theme;
}

MyDocument.getInitialProps = async (ctx): Promise<MyDocumentProps> => {
  const originalRenderPage = ctx.renderPage;
  const muiTheme = createTheme();
  const emotionCache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(emotionCache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (OriginalApp) =>
        function EnhanceApp(props) {
          const EnhancedApp = OriginalApp as MyAppType;
          return (
            <EnhancedApp
              {...props}
              emotionCache={emotionCache}
              muiTheme={muiTheme}
            />
          );
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents Emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
    muiTheme,
  };
};
