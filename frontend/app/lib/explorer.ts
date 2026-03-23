import type { Inscription } from '@/types';

import { buildBackendUrl } from './runtime';

export interface ExplorerFilters {
  contentTypeType: string;
  contentType: string;
  sortOrder: string;
  page: number;
  cursed: boolean;
}

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  sortOrder: 'number_asc',
  contentType: '',
  contentTypeType: '',
  page: 1,
  cursed: false,
};

export const EXPLORER_PAGE_SIZE = 24;

const buildInscriptionsPath = (filter: ExplorerFilters) => {
  let path = '/inscriptions';

  if (filter.contentTypeType) {
    path += `/content_type_type/${filter.contentTypeType}`;
  } else if (filter.contentType) {
    path += `/content_type/${filter.contentType}`;
  } else {
    path += '/';
  }

  const queryParams = new URLSearchParams({
    sortOrder: filter.sortOrder,
    page: filter.page.toString(),
    cursed: String(filter.cursed),
    limit: EXPLORER_PAGE_SIZE.toString(),
  });

  return `${path}?${queryParams.toString()}`;
};

export async function fetchInscriptions(
  filter: ExplorerFilters,
  init?: RequestInit,
): Promise<Inscription[]> {
  try {
    const response = await fetch(buildBackendUrl(buildInscriptionsPath(filter)), init);
    const data: unknown = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      return [];
    }

    return data as Inscription[];
  } catch (error) {
    console.error('Failed to fetch inscriptions:', error);
    return [];
  }
}

export async function fetchInscriptionByNumber(
  inscriptionNumber: string | number,
  init?: RequestInit,
): Promise<Inscription | null> {
  try {
    const response = await fetch(
      buildBackendUrl(`/inscriptions/number/${inscriptionNumber}`),
      init,
    );

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();
    if (!data || Array.isArray(data)) {
      return null;
    }

    return data as Inscription;
  } catch (error) {
    console.error('Failed to fetch inscription:', error);
    return null;
  }
}
