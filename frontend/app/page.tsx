// app/page.tsx
import type { Metadata } from 'next';

import HomePage from './page-home';
import { DEFAULT_EXPLORER_FILTERS, fetchInscriptions } from './lib/explorer';

export const metadata: Metadata = {
  title: 'Explore Litecoin Inscriptions',
  description:
    'Browse the latest Litecoin inscriptions across images, text, audio, video, PDF, and 3D content.',
  openGraph: {
    title: 'Explore Litecoin Inscriptions',
    description:
      'Browse the latest Litecoin inscriptions across images, text, audio, video, PDF, and 3D content.',
    url: '/',
  },
  twitter: {
    title: 'Explore Litecoin Inscriptions',
    description:
      'Browse the latest Litecoin inscriptions across images, text, audio, video, PDF, and 3D content.',
  },
};

export default async function Page() {
  const inscriptions = await fetchInscriptions(DEFAULT_EXPLORER_FILTERS, {
    cache: 'no-store',
  });

  return <HomePage initialInscriptions={inscriptions} />;
}
