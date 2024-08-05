import { useEffect, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import twConfig from '../../../tailwind.config';

export function useTailwindBreakpoint(bp) {
  const [isMatch, setMatch] = useState(false);

  useEffect(() => {
    const handler = event => setMatch(event.matches);
    const mq = window.matchMedia(`(min-width: ${screens[bp]})`);

    setMatch(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler); // pre iOS 14
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        mq.removeListener(handler); // pre iOS 14
      }
    };
  }, [bp]);

  return isMatch;
}

const {
  theme: { screens }
} = resolveConfig(twConfig);
