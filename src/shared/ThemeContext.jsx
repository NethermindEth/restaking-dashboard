import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react';

export const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [systemTheme, setSystemTheme] = useState(mq.matches ? 'dark' : 'light');
  const [resolvedTheme, setResolvedTheme] = useState(systemTheme);
  const [theme, setTheme] = useState(systemTheme);
  const applyTheme = useCallback(
    t => {
      if (!themes.includes(t)) {
        throw new Error(`Invalid theme: ${t}`);
      }

      const useSystemTheme = t === themes[0];
      const actualTheme = useSystemTheme ? systemTheme : t;

      window.document.documentElement.classList.remove(themes[1], themes[2]);
      window.document.documentElement.classList.add(actualTheme);

      setResolvedTheme(actualTheme);
      setTheme(t);

      try {
        window.localStorage.setItem(STORAGE_KEY, t);
      } catch (e) {
        // TODO: log
      }
    },
    [systemTheme]
  );
  const context = useMemo(
    () => ({
      applyTheme,
      resolvedTheme,
      systemTheme,
      theme
    }),
    [applyTheme, resolvedTheme, systemTheme, theme]
  );

  useEffect(() => {
    const handler = event =>
      setSystemTheme(event.matches ? themes[2] : themes[1]);

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
  }, []);

  useLayoutEffect(() => {
    const handler = event => {
      if (event.key !== STORAGE_KEY) return;

      applyTheme(event.newValue);
    };

    window.addEventListener('storage', handler);

    let theme = themes[0];

    try {
      theme = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // TODO: log
    }

    applyTheme(theme || themes[2]);

    return () => window.removeEventListener('storage', handler);
  }, [applyTheme, systemTheme]);

  return (
    <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
  );
}

const mq = window.matchMedia('(prefers-color-scheme: dark)');
const STORAGE_KEY = 'nrd-theme';
const themes = ['system', 'light', 'dark'];
