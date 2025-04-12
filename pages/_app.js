import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Use priority loading for only the top-fold content
  useEffect(() => {
    // Helper to load images with low priority
    const preloadLowPriority = () => {
      // Preload portfolio images with low priority after main content loads
      const imageUrls = [
        '/img/automatons.jpg',
        '/img/drips.jpg',
        '/img/btc-tooling.jpg',
        '/img/btc-tooling-1.jpg',
        '/img/cantoscan.jpg',
        '/img/cantoscan-1.jpg',
        '/img/shishi.jpg',
        '/img/shishi-1.jpg'
      ];
      
      // Create and append link elements
      setTimeout(() => {
        imageUrls.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = url;
          document.head.appendChild(link);
        });
      }, 1000); // Delay by 1 second to ensure top content is loaded first
    };
    
    // Check if this is running in the browser
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback for non-critical initialization
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadLowPriority);
      } else {
        setTimeout(preloadLowPriority, 1000);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="icon" href="/img/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;