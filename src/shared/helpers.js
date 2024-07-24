export const reduceState = (draft, action) => void Object.assign(draft, action);

export const handleServiceError = e => ({
  message: e?.message || 'An unknown error occurred'
});

export const truncateAddress = address =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
