import { useEffect, useState } from 'react';

const useDebounce = (value, delay, isSearchTerm) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const validateSearchTerm = query => {
    const minQueryLength = query.startsWith('0x') ? 5 : 3;
    return query.length === 0 || query.length > minQueryLength;
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isSearchTerm) {
        if (validateSearchTerm(value)) setDebouncedValue(value);
      } else setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, isSearchTerm]);

  return debouncedValue;
};

export default useDebounce;
