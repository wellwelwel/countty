export const formatNumber = (num: number): string => {
  if (num < 1000) return String(num);

  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'k' },
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const val = num / unit.value;

      return val % 1 === 0
        ? `${val.toFixed(0)}${unit.suffix}`
        : `${val.toFixed(2).replace(/\.0$/, '')}${unit.suffix}`;
    }
  }

  return String(num);
};
