export const getGrowthPercentage = (oldValue, newValue) => {
  if (oldValue === 0) {
    return 100;
  }

  return ((newValue - oldValue) / oldValue) * 100;
};

export const handleServiceError = e => ({
  message: e?.message || 'An unknown error occurred'
});

export const reduceState = (draft, action) => void Object.assign(draft, action);

export const truncateAddress = address =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const truncateAddressLg = address =>
  `${address.slice(0, 6)}...${address.slice(-10)}`;
