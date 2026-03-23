import type { MetadataRoute } from 'next';

import { fetchInscriptions, DEFAULT_EXPLORER_FILTERS } from './lib/explorer';
import { getSiteUrl } from './lib/runtime';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl();
    const latestInscriptions = await fetchInscriptions(DEFAULT_EXPLORER_FILTERS, {
        cache: 'no-store',
    });

    const staticRoutes: MetadataRoute.Sitemap = ['', '/stats', '/inscribe', '/account'].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
    }));

    const inscriptionRoutes: MetadataRoute.Sitemap = latestInscriptions.map((inscription) => ({
        url: `${siteUrl}/${inscription.inscription_number}`,
        lastModified: new Date(),
    }));

    return [...staticRoutes, ...inscriptionRoutes];
}
