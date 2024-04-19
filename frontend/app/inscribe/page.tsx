import React from 'react'
import { Metadata } from 'next'
import Head from 'next/head'; // For setting head elements
import Inscribe from './page-home'

export async function generateMetadata(): Promise<Metadata> {

    const baseUrl = 'https://ordlite.io/';
    const imageUrl = `${baseUrl}social_background2.jpg`;

    return {
        title: 'OrdLite.io | Inscribe on Litecoin with Ordinals',
        description: `Upload and secure your files with Ordinals Lite - The longest running public blockchain with 100% uptime.`,
        // OpenGraph Tags for better reach on social media
        openGraph: {
            title: 'OrdLite.io | Inscribe on Litecoin with Ordinals',
            description: `Upload and secure your files with Ordinals Lite - The longest running public blockchain with 100% uptime.`,
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
            title: 'OrdLite.io | Inscribe on Litecoin with Ordinals',
            description: `Upload and secure your files with Ordinals Lite - The longest running public blockchain with 100% uptime.`,
            images: [imageUrl],
            creator: '@ordlite'
        },
    };
}

function page() {
    const title = 'OrdLite.io | Inscribe on Litecoin with Ordinals';
    const description = `Upload and secure your files with Ordinals Lite - The longest running public blockchain with 100% uptime.`
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
            <Inscribe />
        </>
    )
}

export default page