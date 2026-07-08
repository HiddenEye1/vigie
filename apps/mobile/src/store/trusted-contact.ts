import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Moyen de contact du proche : un numéro de téléphone ou une adresse e-mail. */
export type ContactChannel = 'phone' | 'email';

/**
 * Le « proche de confiance » désigné par le senior.
 * Stocké UNIQUEMENT sur ce téléphone (AsyncStorage), jamais envoyé au serveur.
 * Consentement explicite : le senior l'enregistre lui-même, et peut le retirer
 * à tout moment (VISION §3 — veille consentie, jamais surveillance).
 */
export interface TrustedContact {
  readonly name: string;
  readonly channel: ContactChannel;
  readonly value: string;
}

interface TrustedContactState {
  contact: TrustedContact | null;
  save: (contact: TrustedContact) => void;
  clear: () => void;
}

export const useTrustedContact = create<TrustedContactState>()(
  persist(
    (set) => ({
      contact: null,
      save(contact): void {
        set({ contact });
      },
      clear(): void {
        set({ contact: null });
      },
    }),
    {
      name: 'vigie.trusted-contact',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
