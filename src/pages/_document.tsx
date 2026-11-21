import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): React.ReactElement {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta
          content="I'm a designer, front-end dev and open-source contributor with 8+ years experience in the cryptocurrency space."
          name="description"
        />
        <meta content="douvy · website" property="og:title" />
        <meta
          content="https://www.douvy.com/img/milady-border.jpg"
          property="og:image"
        />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/VulfMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/VulfMono-LightItalic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* The profile picture's CSS background. No crossOrigin: the CSS
            request is no-cors, and a mismatched preload is fetched twice. */}
        <link
          rel="preload"
          href="/img/milady-bg.jpg"
          as="image"
          fetchPriority="high"
        />
      </Head>
      <body style={{ minHeight: "100vh" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}