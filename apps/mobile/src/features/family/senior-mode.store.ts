import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SeniorModeState {
  /** Mode simplifié (senior) : accueil épuré, typo agrandie. Réversible. */
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
}

export const useSeniorMode = create<SeniorModeState>()(
  persist(
    (set) => ({
      simpleMode: false,
      setSimpleMode(enabled): void {
        set({ simpleMode: enabled });
      },
    }),
    {
      // Clé conservée telle quelle pour ne pas perdre la préférence déjà stockée.
      name: 'vigie.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
