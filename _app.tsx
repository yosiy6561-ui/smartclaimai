import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>ClaimSmart AI — Legal Analysis Platform</title>
        <meta name="description" content="Generate court-ready legal claims in minutes. AI-powered analysis, evidence review, and professional PDF export." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content="ClaimSmart AI — Legal Analysis Platform" />
        <meta property="og:description" content="Generate court-ready legal claims in minutes. No lawyer needed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://claimsmart.ai" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ClaimSmart AI" />
        <meta name="twitter:description" content="Generate court-ready legal claims in minutes." />
      </Head>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
