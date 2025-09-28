export const ALLOWED_ORIGINS = new Set([
  'https://weslley.io',
  'https://www.weslley.io',
]);

export const isValidOrigin = (origin: string | null): boolean => {
  if (!origin) return false;

  try {
    const url = new URL(origin);

    if (!['https:'].includes(url.protocol)) return false;
    if (url.pathname !== '/') return false;
    if (url.search || url.hash) return false;

    return ALLOWED_ORIGINS.has(origin);
  } catch {
    return false;
  }
};
