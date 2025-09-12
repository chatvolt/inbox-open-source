import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultColors = {
  light: {
    primary: '#6750D6', 
    background: '#F0F2F5', 
    paper: '#FFFFFF',
    textPrimary: '#050505', 
    textSecondary: '#65676B', 
    userBubbleBg: '#E4E6EB',
    userBubbleText: '#050505', 
    agentBubbleBg: '#F0EFFF',
    agentBubbleText: '#3D2C5E',
  },
  dark: { 
    primary: '#7F5AF0',
    background: '#010101',
    paper: '#16161a',
    textPrimary: '#fffffe',
    textSecondary: '#94a1b2',
    userBubbleBg: '#3A3B3C',
    userBubbleText: '#E4E6EB',
    // ALTERADO: Cor da bolha do agente atualizada para o RGB(66, 33, 125) da imagem
    agentBubbleBg: '#42217D', 
    agentBubbleText: '#fffffe',
  }
};

type ColorsObject = typeof defaultColors;

export interface SavedTheme {
  name: string;
  colors: ColorsObject;
  appName: string;
  logoUrl: string;
}

type ThemeConfigState = {
  appName: string;
  logoUrl: string;
  colors: ColorsObject;
  savedThemes: SavedTheme[];
  setAppName: (name: string) => void;
  setLogoUrl: (url: string) => void;
  setColors: (colors: ColorsObject) => void;
  resetToDefaults: () => void;
  saveCurrentTheme: (name: string) => void;
  applySavedTheme: (name: string) => void;
  deleteSavedTheme: (name: string) => void;
};

export const useThemeConfigStore = create<ThemeConfigState>()(
  persist(
    (set, get) => ({
      appName: 'Inbox',
      logoUrl: '',
      colors: defaultColors,
      savedThemes: [], 
      setAppName: (name) => set({ appName: name }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setColors: (newColors) => set({ colors: newColors }),
      resetToDefaults: () => set({ colors: defaultColors, appName: 'Inbox', logoUrl: '' }),
      
      saveCurrentTheme: (name) => {
        const { colors, appName, logoUrl, savedThemes } = get();
        const newTheme: SavedTheme = { name, colors, appName, logoUrl };
        const existingIndex = savedThemes.findIndex(t => t.name === name);

        let updatedThemes = [...savedThemes];
        if (existingIndex > -1) {
          updatedThemes[existingIndex] = newTheme;
        } else {
          updatedThemes.push(newTheme);
        }
        set({ savedThemes: updatedThemes });
      },

      applySavedTheme: (name) => {
        const { savedThemes } = get();
        const themeToApply = savedThemes.find(t => t.name === name);
        if (themeToApply) {
          set({
            colors: themeToApply.colors,
            appName: themeToApply.appName,
            logoUrl: themeToApply.logoUrl,
          });
        }
      },
      
      deleteSavedTheme: (name) => {
        set(state => ({
          savedThemes: state.savedThemes.filter(t => t.name !== name),
        }));
      },
    }),
    {
      name: 'app-theme-config-storage',
    }
  )
);