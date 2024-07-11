/**
 * Formats the given value as a rounded integer.
 * @param {number | bigint} value The value to format.
 * @returns {string} The formatted value.
 */
export const formatInt = value => intFormatter.format(value);

/**
 * Formats the given value as a rounded ETH amount.
 * @param {number | bigint} value The value to format.
 * @returns {string} The formatted value.
 */
export const formatIntETH = value => ethIntFormatter.format(value);

/**
 * Formats the given value as a rounded USD amount.
 * @param {number | bigint} value The value to format.
 * @returns {string} The formatted value.
 */
export const formatIntUSD = value => usdIntFormatter.format(value);

/**
 * Formats the given number using 'k', 'm', or 'b' notation.
 * @param {number} value The value to format.
 * @returns {string} The formatted value.
 */
export const formatShortened = value => {
  if (value >= 1e9) {
    return `${value / 1e9}b`;
  }

  if (value >= 1e6) {
    return `${value / 1e6}m`;
  }

  return `${value / 1e3}k`;
};

// eslint-disable-next-line no-undef
const ethIntFormatter = new Intl.NumberFormat('en-us', {
  currency: 'ETH',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
  style: 'currency'
});

// eslint-disable-next-line no-undef
const intFormatter = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0
});

// eslint-disable-next-line no-undef
const usdIntFormatter = new Intl.NumberFormat('en-us', {
  currency: 'USD',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 0,
  style: 'currency'
});
