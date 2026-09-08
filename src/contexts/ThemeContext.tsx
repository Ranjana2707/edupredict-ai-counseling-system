import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isClayUI: boolean;
  toggleClayUI: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to retrieve theme from localStorage. Falling back to default theme.', error);
    }
    // Default to light as specified in the guidelines:
    // "Default to a clean, high-contrast light theme (soft off-whites and deep charcoal grays) with elegant typography."
    return 'light';
  });

  const [isClayUI, setIsClayUI] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CLAY_UI);
      return saved === 'true';
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage.', error);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isClayUI) {
      root.classList.add('clay-ui');
    } else {
      root.classList.remove('clay-ui');
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CLAY_UI, String(isClayUI));
    } catch (error) {
      console.warn('Failed to save clay ui setting to localStorage.', error);
    }
  }, [isClayUI]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleClayUI = () => {
    setIsClayUI((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isClayUI, toggleClayUI }}>
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
