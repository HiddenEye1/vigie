import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  /** Mode simplifié (senior) : accueil épuré, typo agrandie. Réversible. */
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      simpleMode: false,
      setSimpleMode(enabled): void {
        set({ simpleMode: enabled });
      },
    }),
    {
      name: 'vigie.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
