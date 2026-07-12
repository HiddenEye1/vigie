import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CheckupItemId } from './checkup.items';

/**
 * Confirmations locales du « Check-up sécurité ».
 *
 * Stockées UNIQUEMENT sur ce téléphone (AsyncStorage), jamais envoyées au
 * serveur. On ne garde ici que les items *déclaratifs* : l'item « proche » est
 * dérivé du Bouclier famille, pas dupliqué ici. Déclaratif assumé — l'état
 * reflète ce que l'utilisateur nous indique, pas une vérification du téléphone.
 */
interface CheckupStoreState {
  confirmed: Partial<Record<CheckupItemId, boolean>>;
  /** Date (ISO) du dernier passage sur le bilan, pour le rappel doux local. */
  lastReviewedAt: string | null;
  confirm: (id: CheckupItemId) => void;
  unconfirm: (id: CheckupItemId) => void;
  /** Marque un passage sur l'écran de bilan (appelé au montage de /checkup). */
  markReviewed: () => void;
  reset: () => void;
}

export const useCheckup = create<CheckupStoreState>()(
  persist(
    (set) => ({
      confirmed: {},
      lastReviewedAt: null,
      confirm(id): void {
        set((state) => ({ confirmed: { ...state.confirmed, [id]: true } }));
      },
      unconfirm(id): void {
        set((state) => ({ confirmed: { ...state.confirmed, [id]: false } }));
      },
      markReviewed(): void {
        set({ lastReviewedAt: new Date().toISOString() });
      },
      reset(): void {
        set({ confirmed: {}, lastReviewedAt: null });
      },
    }),
    {
      name: 'vigie.security-checkup',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
