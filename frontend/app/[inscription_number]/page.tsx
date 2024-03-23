// app/[inscription_number]/page.tsx
import React from 'react';
import InscriptionPage from './page-home';
import Head from 'next/head'; // For setting head elements

// app/[inscription_number]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { inscription_number: string };
};

// This function is called during the server-side rendering process
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Use the inscription_number from the route params
  const inscriptionNumber = params.inscription_number;
  
  // Optionally, here you could fetch additional data related to the inscription if needed
  // For simplicity, this example does not fetch additional data

  // Return the dynamic metadata based on the inscription number
  return {
    title: `Inscription ${inscriptionNumber} | OrdLite.io`,
    description: `Inscription ${inscriptionNumber} on Litecoin.`,
    twitter: {
      card: 'summary_large_image',
      title: `Inscription ${inscriptionNumber} | OrdLite.io`,
      description: `Inscription ${inscriptionNumber} on Litecoin.`,
      creator: '@ordlite',
      images: ['https://ordlite.io/background.webp'], // This must be an absolute URL
    },
    // If needed, you can extend or modify the parent metadata
    // For example, to add to the existing openGraph images:
    // openGraph: {
    //   images: ['https://ordlite.io/some-inscription-image.jpg', ...(parent.openGraph?.images || [])],
    // },
  };
}


export default function Page({ params }: { params: { inscription_number: string } }) {
    // Dynamically generate the title and other metadata elements
    const title = `Inscription ${params.inscription_number} | OrdLite.io`;
    const description = 'Explore the history of the Ordinals on Litecoin and its inscriptions.';

    return (
        <>
            <InscriptionPage params={{ inscription_number: params.inscription_number }} />
        </>
    );
}
