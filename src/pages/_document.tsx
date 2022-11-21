import * as React from "react";
import type { DocumentInitialProps } from "next/document";
import Document, { Html, Head, Main, NextScript } from "next/document";
import type { ReactNode } from "react";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../createEmotionCache";
import { font, theme } from "../theme";
import type { MyAppType } from "./_app";

export default class MyDocument extends Document<MyDocumentProps> {
  render() {
    return (
      <Html lang="en" className={font.className}>
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="emotion-insertion-point" content="" />
          {this.props.emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

interface MyDocumentProps extends DocumentInitialProps {
  emotionStyleTags: ReactNode[];
}

MyDocument.getInitialProps = async (ctx): Promise<MyDocumentProps> => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (OriginalApp) =>
        function EnhanceApp(props) {
          const EnhancedApp = OriginalApp as MyAppType;
          return <EnhancedApp {...props} emotionCache={cache} />;
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
  };
};
