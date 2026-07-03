import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalyzeKind, AnalyzeResponse, ScamCategory, VerdictLevel } from '@vigie/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Historique 100 % local (§8.2) — jamais envoyé au serveur. */
export interface HistoryEntry {
  readonly id: string;
  readonly date: string;
  readonly kind: AnalyzeKind;
  readonly excerpt: string;
  readonly verdict: VerdictLevel;
  readonly category: ScamCategory;
  readonly fullResult: AnalyzeResponse;
}

export const HISTORY_LIMIT = 200;
export const EXCERPT_MAX_LENGTH = 200;

interface HistoryState {
  entries: HistoryEntry[];
  add: (input: { kind: AnalyzeKind; excerpt: string; result: AnalyzeResponse }) => HistoryEntry;
  clear: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      add({ kind, excerpt, result }): HistoryEntry {
        const entry: HistoryEntry = {
          id: result.request_id,
          date: new Date().toISOString(),
          kind,
          excerpt: excerpt.trim().slice(0, EXCERPT_MAX_LENGTH),
          verdict: result.verdict,
          category: result.category,
          fullResult: result,
        };
        // Plafond de 200 entrées, les plus récentes d'abord (FIFO §8.2).
        set((state) => ({ entries: [entry, ...state.entries].slice(0, HISTORY_LIMIT) }));
        return entry;
      },
      clear(): void {
        set({ entries: [] });
      },
    }),
    {
      name: 'vigie.history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Sélecteur : entrée par identifiant (id = request_id de l'analyse). */
export function selectEntryById(id: string): (state: HistoryState) => HistoryEntry | undefined {
  return (state) => state.entries.find((entry) => entry.id === id);
}
