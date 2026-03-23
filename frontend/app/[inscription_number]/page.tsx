import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import type { Inscription } from '@/types';

import InscriptionLayout from './layout';
import InscriptionDetailClient from './InscriptionDetailClient';
import { fetchInscriptionByNumber } from '../lib/explorer';

interface PageProps {
    params: {
        inscription_number: string;
    };
}

const buildInscriptionDescription = (inscription: Inscription | null, inscriptionNumber: string) => {
    if (!inscription) {
        return `View inscription #${inscriptionNumber} on the Litecoin blockchain.`;
    }

    const contentType = inscription.content_type || 'unknown content';
    const fileSize = inscription.content_length ? `${inscription.content_length} bytes` : 'unknown size';
    return `View Litecoin inscription #${inscriptionNumber}, a ${contentType} inscription with ${fileSize} of on-chain content.`;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const inscription = await fetchInscriptionByNumber(params.inscription_number, {
        cache: 'no-store',
    });

    const title = `Inscription #${Number(params.inscription_number).toLocaleString()}`;
    const description = buildInscriptionDescription(inscription, params.inscription_number);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `/${params.inscription_number}`,
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const inscription = await fetchInscriptionByNumber(params.inscription_number, {
        cache: 'no-store',
    });

    if (!inscription) {
        notFound();
    }

    return (
        <InscriptionLayout>
            <InscriptionDetailClient
                inscription={inscription}
                inscriptionNumber={params.inscription_number}
            />
        </InscriptionLayout>
    );
}
