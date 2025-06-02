import "@/styles/globals.css";
import Head from "next/head";
import React, { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { Lora } from "next/font/google";

// Initialize the Lora font
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  // Use priority loading for only the top-fold content
  useEffect(() => {
    // Helper to load images with low priority
    const preloadLowPriority = (): void => {
      // Preload portfolio images with low priority after main content loads
      const imageUrls = [
        "/img/automatons.jpg",
        "/img/drips.jpg",
        "/img/btc-tooling.jpg",
        "/img/btc-tooling-1.jpg",
        "/img/cantoscan.jpg",
        "/img/cantoscan-1.jpg",
        "/img/shishi.jpg",
        "/img/shishi-1.jpg",
      ];

      // Create and append link elements
      setTimeout(() => {
        imageUrls.forEach((url, index) => {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = url;
          // Add a key-like attribute for better maintainability
          link.setAttribute('data-preload-id', `portfolio-img-${index}`);
          document.head.appendChild(link);
        });
      }, 1000); // Delay by 1 second to ensure top content is loaded first
    };

    // Check if this is running in the browser
    if (typeof window !== "undefined") {
      // Use requestIdleCallback with fallback for better browser compatibility
      if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(preloadLowPriority);
      } else {
        setTimeout(preloadLowPriority, 1000);
      }
    }
  }, []);

  return (
    <>
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
    </>
  );
}

export default MyApp;