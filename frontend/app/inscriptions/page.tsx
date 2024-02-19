'use client'
// app/index.tsx

import { useEffect, useState } from 'react';

interface Inscription {
  address: string;
  charms: string[];
  children: string[];
  content_length: number;
  content_type: string;
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

export default function Home() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);

  useEffect(() => {
    const fetchInscriptions = async () => {
      console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/inscriptions`);
      const data = await response.json();
      setInscriptions(data);
    };

    fetchInscriptions();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold">Inscriptions</h1>
      <ul className="list-disc">
        {inscriptions.map((inscription) => (
          <li key={inscription.inscription_id}>{inscription.inscription_number} - {inscription.content_type}</li>
        ))}
      </ul>
    </div>
  );
}
