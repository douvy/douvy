import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="icon" href="/assets/img/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;