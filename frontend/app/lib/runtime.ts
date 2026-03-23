const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

const browserHost = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.location.hostname === '0.0.0.0'
    ? '127.0.0.1'
    : window.location.hostname;
};

export const getSiteUrl = () => {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (configured) {
    const normalized = configured.startsWith('http')
      ? configured
      : `https://${configured}`;

    return stripTrailingSlash(normalized);
  }

  const host = browserHost();
  if (host && typeof window !== 'undefined') {
    return `${window.location.protocol}//${host}:3100`;
  }

  return 'http://127.0.0.1:3100';
};

export const getBackendBaseUrl = () => {
  const configured =
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configured) {
    return stripTrailingSlash(configured).replace(/\/api$/, '');
  }

  const host = browserHost();
  if (host && typeof window !== 'undefined') {
    return `${window.location.protocol}//${host}:3005`;
  }

  return 'http://127.0.0.1:3005';
};

export const getOrdContentBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_ORD_BASE_URL?.trim();

  if (configured) {
    return stripTrailingSlash(configured);
  }

  const host = browserHost();
  if (host && typeof window !== 'undefined') {
    return `${window.location.protocol}//${host}:8081`;
  }

  return 'http://127.0.0.1:8081';
};

export const buildBackendUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
};

export const buildOrdContentUrl = (inscriptionId: string) =>
  `${getOrdContentBaseUrl()}/content/${inscriptionId}`;
