import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, predefinedThemes } from '../lib/themes';
import { supabase } from '../lib/supabase';

interface ThemeContextType {
  activeTheme: Theme;
  themes: Theme[];
  setActiveTheme: (theme: Theme) => void;
  saveCustomTheme: (theme: Theme) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>(predefinedThemes);
  const [activeTheme, setActiveThemeState] = useState<Theme>(predefinedThemes[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load themes from Supabase and local storage
  useEffect(() => {
    const loadThemes = async () => {
      let loadedThemes = [...predefinedThemes];
      try {
        // Try to load from Supabase
        const { data, error } = await supabase.from('themes').select('*');
        if (!error && data && data.length > 0) {
          // Merge supabase themes
          data.forEach((st) => {
             const existingIdx = loadedThemes.findIndex(t => t.id === st.id);
             if (existingIdx >= 0) loadedThemes[existingIdx] = st;
             else loadedThemes.push(st);
          });
        }
      } catch (err) {
        /* Supabase not reachable — fall back to local custom themes */
      }

      // Check local storage for custom themes
      const localCustomThemes = localStorage.getItem('customThemes');
      if (localCustomThemes) {
        try {
          const parsed = JSON.parse(localCustomThemes);
          parsed.forEach((ptheme) => {
            if (!loadedThemes.find(t => t.id === ptheme.id)) {
              loadedThemes.push(ptheme);
            }
          });
        } catch (e) {}
      }

      setThemes(loadedThemes);

      // Load active theme from local storage
      const savedThemeId = localStorage.getItem('activeThemeId');
      if (savedThemeId) {
        const found = loadedThemes.find(t => t.id === savedThemeId);
        if (found) setActiveThemeState(found);
      }

      // Load dark mode preference
      const savedDarkMode = localStorage.getItem('isDarkMode');
      if (savedDarkMode === 'true') {
        setIsDarkMode(true);
      }
    };
    loadThemes();
  }, []);

  const setActiveTheme = (theme: Theme) => {
    setActiveThemeState(theme);
    localStorage.setItem('activeThemeId', theme.id);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('isDarkMode', String(newValue));
      return newValue;
    });
  };

  const saveCustomTheme = async (theme: Theme) => {
    const newThemes = [...themes.filter(t => t.id !== theme.id), theme];
    setThemes(newThemes);
    setActiveTheme(theme);

    // Save custom themes locally
    const customThemes = newThemes.filter(t => !predefinedThemes.find(pt => pt.id === t.id));
    localStorage.setItem('customThemes', JSON.stringify(customThemes));

    try {
      await supabase.from('themes').upsert(theme);
    } catch (err) {
      /* Could not save to Supabase — saved locally */
    }
  };

  // Apply CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const { colors, fonts, styles } = activeTheme;

    if (isDarkMode) {
      root.classList.add('dark');
      // In dark mode, we override the background and text colors, but keep primary colors
      root.style.setProperty('--theme-bg', '#0f172a'); // slate-900
      root.style.setProperty('--theme-surface', '#1e293b'); // slate-800
      root.style.setProperty('--theme-text', '#f8fafc'); // slate-50
      root.style.setProperty('--theme-muted', '#94a3b8'); // slate-400
      root.style.setProperty('--theme-secondary', '#334155'); // slate-700
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--theme-bg', colors.background);
      root.style.setProperty('--theme-surface', colors.surface);
      root.style.setProperty('--theme-text', colors.text);
      root.style.setProperty('--theme-muted', colors.muted);
      root.style.setProperty('--theme-secondary', colors.secondary);
    }

    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-dark', colors.primaryDark);
    root.style.setProperty('--theme-primary-light', colors.primaryLight);
    
    root.style.setProperty('--theme-font-sans', fonts.sans);
    root.style.setProperty('--theme-font-serif', fonts.serif);

    // Button Styles
    let btnRadius = '0.5rem';
    let btnShadow = 'none';
    if (styles.buttonStyle === 'rounded') btnRadius = '9999px';
    if (styles.buttonStyle === 'sharp') btnRadius = '0px';
    if (styles.buttonStyle === 'glow') {
      btnRadius = '0.5rem';
      btnShadow = `0 0 15px ${colors.primary}80`;
    }
    root.style.setProperty('--theme-btn-radius', btnRadius);
    root.style.setProperty('--theme-btn-shadow', btnShadow);

    // Animation Intensity
    let animDuration = '0.3s';
    if (styles.animationIntensity === 'low') animDuration = '0.1s';
    if (styles.animationIntensity === 'high') animDuration = '0.5s';
    root.style.setProperty('--theme-anim-duration', animDuration);

    // Background Style
    if (styles.backgroundStyle === 'gradient') {
      const bg = isDarkMode ? '#0f172a' : colors.background;
      const surface = isDarkMode ? '#1e293b' : colors.surface;
      root.style.setProperty('--theme-bg-image', `linear-gradient(135deg, ${bg} 0%, ${surface} 100%)`);
    } else if (styles.backgroundStyle === 'image') {
      root.style.setProperty('--theme-bg-image', `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop')`);
    } else {
      root.style.setProperty('--theme-bg-image', 'none');
    }

  }, [activeTheme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ activeTheme, themes, setActiveTheme, saveCustomTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
