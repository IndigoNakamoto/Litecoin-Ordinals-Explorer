// frontend/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Menu from './components/menu';
import StickyFooter from './components/StickyFooter';
import { getSiteUrl } from './lib/runtime';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'OrdLite.io',
    template: '%s | OrdLite.io',
  },
  description: 'Discover, preview, and inscribe content on the Litecoin blockchain.',
  applicationName: 'OrdLite.io',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'OrdLite.io',
    title: 'OrdLite.io',
    description: 'Discover, preview, and inscribe content on the Litecoin blockchain.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrdLite.io',
    description: 'Discover, preview, and inscribe content on the Litecoin blockchain.',
  },
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
