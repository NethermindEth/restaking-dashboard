const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
});

export function formatNumber(value, compact) {
  if (compact) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}m`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
  }

  return numberFormatter.format(value);
}

export const assetFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
