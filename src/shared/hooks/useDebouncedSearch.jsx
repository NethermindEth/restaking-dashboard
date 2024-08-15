import { useEffect, useState } from 'react';

const useDebouncedSearch = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const validateSearchTerm = query => {
    return query.length === 0 || query.length >= 3;
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
