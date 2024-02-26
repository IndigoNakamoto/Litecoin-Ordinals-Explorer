//frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Menu from './components/menu';
import StickyFooter from "./components/StickyFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrdLite.io",
  description: "Search and browse ordinal inscriptions on Litecoin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Menu />
        {children}
        <StickyFooter />
      </body>
    </html>
  );
}
