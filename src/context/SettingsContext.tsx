import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  homepage: string;
  theme: string;
  language: string;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const defaultSettings: Settings = {
  homepage: '/dashboard', // '/dashboard' | '/calculator' | '/disease' | etc.
  theme: 'light', // 'light' | 'dark' | 'system'
  language: 'en', // 'en' | 'hi' | ...
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
});

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('globalSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Initialize theme on mount
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System default - detect user's system preference
      root.classList.remove('light', 'dark');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
  }, []); // Run only on mount

  useEffect(() => {
    localStorage.setItem('globalSettings', JSON.stringify(settings));
    
    // Theme switching logic
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System default - detect user's system preference
      root.classList.remove('light', 'dark');
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    }
    
    // Language switching placeholder
    // Here you would integrate i18n library if needed
    document.documentElement.lang = settings.language;
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => useContext(SettingsContext);