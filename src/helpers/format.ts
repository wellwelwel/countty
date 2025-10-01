export const formatNumber = (num: number): string =>
  Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
