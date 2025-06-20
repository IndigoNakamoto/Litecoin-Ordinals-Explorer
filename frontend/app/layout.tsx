// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Menu from './components/menu';
import StickyFooter from "./components/StickyFooter";
import Head from 'next/head'; // Import Head

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  metadata: pageMetadata = {}, // Accept metadata as props, default to an empty object
}: Readonly<{
  children: React.ReactNode;
  metadata?: Partial<Metadata>; // Make metadata optional and partial
}>) {
  // Define default metadata, merge with page-specific metadata
  const metadata: Metadata = {
    title: "OrdLite.io",
    description: "Discover and Inscribe the Litecoin Blockchain with OrdLite.io",
    ...pageMetadata, // Spread page-specific metadata, allowing overrides
  };

  return (
    <>
      <Head>
        {/* <title>{metadata.title ?? ''}</title> */}
        {/* <title>stuff</title>  not wokring */}
        <meta name="description" content={metadata.description ?? ''} />
        {/* Add more global metadata tags here */}
      </Head>
      <html lang="en">
        <body className={inter.className}>
          <Menu />
          {children}
          <StickyFooter />
        </body>
      </html>
    </>
  );
}
