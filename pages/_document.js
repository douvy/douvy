import { Html, Head, Main, NextScript } from 'next/document';

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
        <meta content="https://www.douvy.com/assets/img/favicon.png" property="og:image" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}