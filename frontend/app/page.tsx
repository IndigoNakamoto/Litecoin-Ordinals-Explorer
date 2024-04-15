// app/page.tsx
import React from 'react';
import HomePage from './page-home'; // Importing the HomePage Client Component
import { Metadata } from 'next'
import Head from 'next/head'; // For setting head elements

interface FilterType {
  contentTypeType: string
  contentType: string
  sortBy: string
  page: number
  cursed: boolean
}

interface Inscription {
  address: string;
  charms: string[];
  children: string[];
  content_length: number;
  content_type: string;
  content_type_type: string;
  genesis_fee: number;
  genesis_height: number;
  inscription_id: string;
  inscription_number: number;
  next: string;
  output_value: number;
  parent: string;
  previous: string;
  rune: string;
  sat: string;
  satpoint: string;
  timestamp: string;
}


// export const metadata: Metadata = {
//   title: 'OrdLite.io | Ordinals Explorer for Litecoin',
//   description: 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.',
//   twitter: {
//     card: 'summary_large_image',
//     title: 'OrdLite.io | Ordinals Explorer for Litecoin',
//     description: 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.',
//     creator: '@ordlite',
//     images: ['https://www.ordlite.io/social_background2.jpg'], // Must be an absolute URL
//   },
// }


export async function generateMetadata(): Promise<Metadata> {

  const baseUrl = 'https://ordlite.io/';
  const imageUrl = `${baseUrl}social_background2.jpg`;

  return {
    title: 'OrdLite.io | Ordinals Explorer for Litecoin',
    description: 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.',
    // OpenGraph Tags for better reach on social media
    openGraph: {
      title: 'OrdLite.io | Ordinals Explorer for Litecoin',
      description: 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.',
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
      title: 'OrdLite.io | Ordinals Explorer for Litecoin',
      description: 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.',
      images: [imageUrl],
      creator: '@ordlite'
    },
  };
}


async function fetchInscriptions(filter: FilterType) {
  // Base URL for the inscriptions endpoints
  let baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions`;

  // Determine the correct endpoint based on the filters
  if (filter.contentTypeType) {
    baseUrl += `/content_type_type/${filter.contentTypeType}`;
  } else if (filter.contentType) {
    baseUrl += `/content_type/${filter.contentType}`;
  } else {
    baseUrl += '/'; // Default to getting all inscriptions
  }

  // Build the query parameters
  const queryParams = new URLSearchParams({
    sortOrder: 'oldest',
    page: filter.page?.toString() || '1',
    cursed: filter.cursed.toString(),
    limit: '50', // Assuming you want to keep the limit or it can be adjusted based on your requirements
  }).toString();

  // Complete URL with query parameters
  const url = `${baseUrl}?${queryParams}`;

  // Fetch the data from the backend
  const response = await fetch(url);
  const data = await response.json();
  return data
}

async function fetchTotalCount() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/total_count`);
  const { count } = await response.json();
  return count;

}

// This is a Server Component
export default async function Page() {
  // Example data fetching in Server Component
  const filter = { sortBy: 'oldest', contentType: '', contentTypeType: '', page: 1, cursed: false };
  const inscriptions = await fetchInscriptions(filter);
  const totalCount = await fetchTotalCount();
  // const inscriptions:Inscription[] = []
  // Forward fetched data to your Client Component
  const title = 'OrdLite.io | Ordinals Explorer for Litecoin';
  const description = 'Explore the files secured by Ordinals on Litecoin - The most reliable blockchain with unmatched 100% uptime.';
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
      <HomePage initialInscriptions={inscriptions} />
    </>
  );
}
