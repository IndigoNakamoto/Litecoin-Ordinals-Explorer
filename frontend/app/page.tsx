// app/page.tsx
import React from 'react';
import HomePage from './page-home'; // Importing the HomePage Client Component
import { Metadata } from 'next'

interface FilterType {
    sortBy: string
    contentType: string
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


export const metadata: Metadata = {
title: 'OrdLite.io',
description: '',
// TODO
} 

// Assuming this fetchInscriptions function replaces the data fetching logic previously found in HomePage
async function fetchInscriptions(lastInscriptionNumber: number | undefined, filter: FilterType) {
  const query = new URLSearchParams({
    lastInscriptionNumber: lastInscriptionNumber?.toString() || '',
    sortBy: filter.sortBy,
    contentType: filter.contentType,
    cursed: filter.cursed.toString(),
  }).toString();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions?${query}`);
  const inscriptions = await response.json();
  return inscriptions;
}

// This is a Server Component
export default async function Page() {
  // Example data fetching in Server Component
  const filter = { sortBy: 'oldest', contentType: 'All', cursed: false };
  const lastInscriptionNumber = undefined; // This value can be dynamically determined based on request or other logic
  const inscriptions = await fetchInscriptions(lastInscriptionNumber, filter);
  // const inscriptions:Inscription[] = []
  // Forward fetched data to your Client Component
  return <HomePage initialInscriptions={inscriptions} />;
}
