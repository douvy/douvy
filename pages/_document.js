import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta
          content="I'm a designer, front-end dev and open-source contributor with 6 years experience in the cryptocurrency space."
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
          href="/fonts/DegularDisplay-Black.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
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

        {/* Preload critical images */}
        <link
          rel="preload"
          href="/img/milady-no-bg.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/img/milady-blink.png"
          as="image"
          fetchPriority="high"
        />
        {/* Background image has maximum priority - it should NEVER be changed during animations */}
        <link
          rel="preload"
          href="/img/milady-bg.jpg"
          as="image"
          fetchPriority="high"
          importance="high"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/img/milady-mouth-open.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/img/milady-glasses.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/img/milady-glasses-blink.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/img/zaar-flip.jpg"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/img/zaar-flip-1.jpg"
          as="image"
          fetchPriority="high"
        />

        {/* External stylesheets */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
        />

        <link
          rel="stylesheet"
          href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
        />
      </Head>
      <body style={{ minHeight: "100vh" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
