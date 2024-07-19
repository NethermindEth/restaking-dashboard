import { useEffect, useState } from 'react';

const useDebouncedSearch = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const validateSearchTerm = query => {
    const minQueryLength = query.startsWith('0x') ? 5 : 3;
    return query.length === 0 || query.length > minQueryLength;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (validateSearchTerm(value)) setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebouncedSearch;
