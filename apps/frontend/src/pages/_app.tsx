import { AppProps } from 'next/app';
import Head from 'next/head';
import "../app/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Kardelo - Your Task Management App</title>
        <meta name="description" content="Manage your tasks efficiently with Kardelo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
