// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Menu from './components/menu';
import StickyFooter from "./components/StickyFooter";
import Footer from './components/Footer'
// import Head from 'next/head'; // Import Head

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

      <html lang="en">
        <body className={inter.className}>
          <div className="flex flex-col min-h-screen">
            <Menu />
            <div className="flex-grow">{children}</div>
            <Footer />
          </div>
        </body>
      </html>
    </>
  );
}
