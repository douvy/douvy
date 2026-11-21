import React from "react";
import { Html, Head, Main, NextScript } from "next/document";
import { THEME_PENDING_CLASS, THEME_STORAGE_KEY } from "@/contexts/ThemeContext";

// Runs before first paint. If the visitor's theme is light (their stored
// choice, else their system setting) it puts the light background up
// immediately and hides the dark server-rendered content until React has
// switched it - see ThemeContext. The timeout is a safety net: if React never
// takes over, the content still appears.
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}if(t==='light'){var c=document.documentElement.classList;c.add('light',${JSON.stringify(THEME_PENDING_CLASS)});setTimeout(function(){c.remove(${JSON.stringify(THEME_PENDING_CLASS)})},3000)}}catch(e){}})();`;

export default function Document(): React.ReactElement {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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