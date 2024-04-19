import React from 'react'
import InfoPage from './page-home'
import { Metadata } from 'next'
import Head from 'next/head'; // For setting head elements


export async function generateMetadata(): Promise<Metadata> {

  const baseUrl = 'https://ordlite.io/';
  const imageUrl = `${baseUrl}social_background2.jpg`;

  return {
    title: 'OrdLite.io | Information and Stats for Ordinals Lite',
    description: `Stats & info on Ordinals Lite: inscriptions, storage, fees, media types, and Inscription 0 (Mimblewimble)`,
    // OpenGraph Tags for better reach on social media
    openGraph: {
      title: 'OrdLite.io | Information and Stats for Ordinals Lite',
      description: `Stats & info on Ordinals Lite: inscriptions, storage, fees, media types, and Inscription 0 (Mimblewimble)`,
      url: `${baseUrl}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `OrdLite.io | Ordinals Explorer for Litecoin`,
        }
      ],
      siteName: 'OrdLite.io',
    },
    // Twitter Card Metadata
    twitter: {
      card: 'summary_large_image',
      site: '@ordlite',
      title: 'OrdLite.io | Information and Stats for Ordinals Lite',
      description: `Stats & info on Ordinals Lite: inscriptions, storage, fees, media types, and Inscription 0 (Mimblewimble)`,
      images: [imageUrl],
      creator: '@ordlite'
    },
  };
}

function page() {
  const title = 'OrdLite.io | Information and Stats for Ordinals Lite';
  const description = `Stats & info on Ordinals Lite: inscriptions, storage, fees, media types, and Inscription 0 (Mimblewimble)`
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
      <InfoPage />
    </>
  )
}

export default page