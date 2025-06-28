import { useEffect } from 'react';

export type ThemeType = 'claro' | 'escuro' | 'automático';

export function useTheme(theme: ThemeType) {
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'escuro') {
      root.classList.add('dark');
    } else if (theme === 'claro') {
      root.classList.remove('dark');
    } else {
      // Automático: segue o sistema
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);
} 