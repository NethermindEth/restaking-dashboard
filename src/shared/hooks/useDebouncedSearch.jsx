import { useEffect, useState } from 'react';

export default function useDebouncedSearch(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    let timeout;

    if (validateSearchTerm(value)) {
      timeout = setTimeout(() => setDebouncedValue(value), delay);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

const validateSearchTerm = query =>
  (query?.length ?? 0) === 0 || query.length >= 3;
