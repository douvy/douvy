import React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): React.ReactElement {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta
          content="Design engineer, 8+ years in crypto. I prototype and ship interfaces directly in the browser, concept through production."
          name="description"
        />

        {/* Link previews. twitter:card is what makes Twitter show the large
            image; it reads the title, description and image from the og tags. */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.douvy.com/" />
        <meta property="og:title" content="douvy · website" />
        <meta
          property="og:description"
          content="Design engineer, 8+ years in crypto. I prototype and ship interfaces directly in the browser, concept through production."
        />
        <meta property="og:image" content="https://www.douvy.com/img/og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@douvy_" />

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