import "@/styles/globals.css";
import Head from "next/head";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { Lora } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Initialize the Lora font
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <ThemeProvider>
      <style jsx global>{`
        :root {
          --font-lora: ${lora.style.fontFamily};
        }
      `}</style>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="icon" href="/img/favicon.png" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}

export default MyApp;