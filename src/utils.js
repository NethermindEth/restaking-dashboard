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

export function formatDate(dateString) {
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  const diffMs = currentDate - inputDate;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return `today`;
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    const diffMonths =
      currentDate.getMonth() -
      inputDate.getMonth() +
      12 * (currentDate.getFullYear() - inputDate.getFullYear());

    if (diffMonths < 12) {
      return `${diffMonths} months ago`;
    } else {
      const diffYears = Math.floor(diffMonths / 12);
      return `${diffYears} years ago`;
    }
  }
}

export const assetFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
