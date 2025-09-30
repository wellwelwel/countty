export const normalizeSlug = (slug: string): string =>
  encodeURIComponent(slug.trim().substring(0, 255).trim());
