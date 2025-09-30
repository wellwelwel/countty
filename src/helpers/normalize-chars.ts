export const normalizeSlug = (text: string): string =>
  text
    .normalize('NFD')
    .trim()
    .replace(/[^a-z0-9-]/g, '');
