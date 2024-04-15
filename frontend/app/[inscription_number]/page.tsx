// app/[inscription_number]/page.tsx
import React from 'react';
import InscriptionPage from './page-home';

import type { Metadata } from 'next';

type Props = {
  params: { inscription_number: string };
};

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const inscriptionNumber = params.inscription_number;

  const baseUrl = 'https://ordlite.io/';
  const imageUrl = `${baseUrl}social_background2.jpg`;

  return {
    title: `Inscription ${inscriptionNumber} | OrdLite.io`,
    description: `View Litecoin Ordinal Inscription ${inscriptionNumber} on OrdLite.io`,
    // OpenGraph Tags for better reach on social media
    openGraph: {
      title: `Inscription ${inscriptionNumber} | OrdLite.io`,
      description: `View Litecoin Ordinal Inscription ${inscriptionNumber} on OrdLite.io`,
      url: `${baseUrl}${inscriptionNumber}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `Inscription ${inscriptionNumber}`,
        }
      ],
      siteName: 'OrdLite.io',
    },
    // Twitter Card Metadata
    twitter: {
      card: 'summary_large_image',
      site: '@ordlite',
      title: `Inscription ${inscriptionNumber} | OrdLite.io`,
      description: `View Litecoin Ordinal Inscription ${inscriptionNumber} on OrdLite.io`,
      images: [imageUrl],
      creator: '@ordlite'
    },
  };
}

export default function Page({ params }: { params: { inscription_number: string } }) {

  return (
    <>
      <InscriptionPage params={{ inscription_number: params.inscription_number }} />
    </>
  );
}