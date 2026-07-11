import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScamCategory, VerdictLevel } from '@vigie/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Type de situation à l'origine d'une demande d'avis. */
export type AdviceSituation = 'message' | 'lien' | 'aide';

/**
 * Trace LOCALE d'une demande d'avis envoyée à un proche (Bouclier famille).
 * Stockée uniquement sur ce téléphone (AsyncStorage), jamais envoyée au serveur.
 *
 * Confidentialité (§8) : ne contient JAMAIS le contenu original analysé, ni les
 * raisons, ni les actions, ni le score / pourcentage de confiance — seulement le
 * prénom du proche (déjà local), l'horodatage, le type de situation, et le
 * verdict / la catégorie de Vigie quand ils existent.
 *
 * Ce n'est PAS une confirmation de réception : l'entrée signifie « vous avez
 * ouvert une demande », pas « le proche a reçu ou lu ».
 */
export interface AdviceRequestEntry {
  readonly id: string;
  readonly date: string;
  readonly contactFirstName: string;
  readonly situation: AdviceSituation;
  readonly verdict?: VerdictLevel;
  readonly category?: ScamCategory;
}

/** Ce que Vigie sait au moment de la demande (verdict/catégorie facultatifs). */
export interface AdviceRequestInput {
  readonly contactFirstName: string;
  readonly situation: AdviceSituation;
  readonly verdict?: VerdictLevel;
  readonly category?: ScamCategory;
}

export const ADVICE_REQUESTS_LIMIT = 30;

interface AdviceRequestsState {
  entries: AdviceRequestEntry[];
  add: (input: AdviceRequestInput) => void;
  clear: () => void;
}

/** Identifiant local simple (pas d'usage cryptographique). */
function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAdviceRequests = create<AdviceRequestsState>()(
  persist(
    (set) => ({
      entries: [],
      add(input): void {
        const entry: AdviceRequestEntry = {
          id: newId(),
          date: new Date().toISOString(),
          contactFirstName: input.contactFirstName,
          situation: input.situation,
          // La catégorie neutre AUCUNE n'apporte rien : on ne la garde pas.
          ...(input.verdict !== undefined ? { verdict: input.verdict } : {}),
          ...(input.category !== undefined && input.category !== 'AUCUNE'
            ? { category: input.category }
            : {}),
        };
        // Plafond de 30 entrées, les plus récentes d'abord.
        set((state) => ({ entries: [entry, ...state.entries].slice(0, ADVICE_REQUESTS_LIMIT) }));
      },
      clear(): void {
        set({ entries: [] });
      },
    }),
    {
      name: 'vigie.advice-requests',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
