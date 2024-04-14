// app/[inscription_number]/page.tsx
import React from 'react';
import InscriptionPage from './page-home';
import Head from 'next/head'; // For setting head elements

import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { inscription_number: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const inscriptionNumber = params.inscription_number;

  const baseUrl = 'https://ordlite.io/';
  const imageUrl = `${baseUrl}social_background2.jpeg`;

  return {
    title: `Inscription ${inscriptionNumber} | OrdLite.io`,
    description: `View Inscription ${inscriptionNumber} on OrdLite.io`,
    // OpenGraph Tags for better reach on social media
    openGraph: {
      title: `Inscription ${inscriptionNumber} | OrdLite.io`,
      description: `View Inscription ${inscriptionNumber} on OrdLite.io`,
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
      description: `View Inscription ${inscriptionNumber} on OrdLite.io`,
      images: [imageUrl],
      creator: '@ordlite'
    },
  };
}

export default function Page({ params }: { params: { inscription_number: string } }) {
    const title = `Inscription ${params.inscription_number} | OrdLite.io`;
    const description = 'Explore the inscriptions secured by Ordinals on Litecoin.';

    return (
        <>
          <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://www.ordlite.io/social_background2.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@ordlite" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="https://www.ordlite.io/social_background2.jpg" />
          </Head>
          <InscriptionPage params={{ inscription_number: params.inscription_number }} />
        </>
    );
}