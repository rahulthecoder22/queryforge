import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeId = 'midnight' | 'dawn';

interface SettingsState {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'midnight',
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme === 'dawn' ? 'dawn' : '';
        set({ theme });
      },
    }),
    {
      name: 'queryforge-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dawn') {
          document.documentElement.dataset.theme = 'dawn';
        } else {
          document.documentElement.dataset.theme = '';
        }
      },
    },
  ),
);
