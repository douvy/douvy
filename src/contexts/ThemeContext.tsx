import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** localStorage key for a theme the visitor picked themselves. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Class the inline script in _document puts on <html> when the visitor's
 * theme is light. The page is server-rendered dark, so until React has
 * switched it the content is hidden (see globals.css) - otherwise light-theme
 * visitors would watch the page flip from dark on every load.
 */
export const THEME_PENDING_CLASS = 'theme-pending';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// A stored choice wins; otherwise follow the system setting. Storage can
// throw (private mode, blocked cookies), in which case fall through.
function preferredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Must start as 'dark' to match the server-rendered HTML; the real
  // preference is applied right after hydration
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTheme(preferredTheme());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Wait for the preference: applying the initial 'dark' first would undo
    // the class the inline script set
    if (!isLoaded) return;
    const root = document.documentElement;
    const wasPending = root.classList.contains(THEME_PENDING_CLASS);
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    if (!wasPending) return;
    // Elements fade between theme colours over 300ms; reveal after that so
    // the fade from the dark render isn't seen
    const reveal = setTimeout(() => root.classList.remove(THEME_PENDING_CLASS), 350);
    return () => clearTimeout(reveal);
  }, [theme, isLoaded]);

  // Only an explicit toggle is remembered, so visitors who never touch it
  // keep following their system setting
  const toggleTheme = useCallback(() => {
    setTheme((previous) => {
      const next = previous === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
