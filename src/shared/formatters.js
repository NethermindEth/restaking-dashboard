/**
 * Formats the given value as a rounded ETH amount.
 * @param {number | bigint} value The value to format.
 * @param {boolean} compact Whether to use compact notation.
 * @returns {string} The formatted value.
 */
export const formatETH = (value, compact) =>
  `${(compact ? numCompactFormatter : numIntFormatter).format(value)} ETH`;

/**
 * Formats the given value as a rounded integer.
 * @param {number | bigint} value The value to format.
 * @param {boolean} compact Whether to use compact notation.
 * @returns {string} The formatted value.
 */
export const formatNumber = (value, compact) =>
  (compact ? numCompactFormatter : numIntFormatter).format(value);

/**
 * Formats the given value as a rounded USD amount.
 * @param {number | bigint} value The value to format.
 * @param {boolean} compact Whether to use compact notation.
 * @returns {string} The formatted value.
 */
export const formatUSD = (value, compact) =>
  (compact ? usdCompactFormatter : usdIntFormatter).format(value);

// eslint-disable-next-line no-undef
const numCompactFormatter = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  notation: 'compact'
});

// eslint-disable-next-line no-undef
const numIntFormatter = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0
});

// eslint-disable-next-line no-undef
const usdCompactFormatter = new Intl.NumberFormat('en-us', {
  currency: 'USD',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
  style: 'currency',
  notation: 'compact'
});

// eslint-disable-next-line no-undef
const usdIntFormatter = new Intl.NumberFormat('en-us', {
  currency: 'USD',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 0,
  style: 'currency'
});
