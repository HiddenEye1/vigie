import type { Ionicons } from '@expo/vector-icons';

export type VerifyMode = 'texte' | 'capture' | 'lien';

export interface VerifyModeItem {
  readonly key: VerifyMode;
  readonly label: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly route: '/verifier-texte' | '/verifier-capture' | '/verifier-lien';
}

/**
 * Les trois modes de vérification, partagés entre l'accueil et les écrans de
 * saisie pour garantir les mêmes onglets partout (une seule source de vérité).
 */
export const VERIFY_MODES = [
  { key: 'texte', label: 'Message', icon: 'chatbubble-ellipses-outline', route: '/verifier-texte' },
  { key: 'capture', label: 'Capture', icon: 'image-outline', route: '/verifier-capture' },
  { key: 'lien', label: 'Lien', icon: 'link-outline', route: '/verifier-lien' },
] as const satisfies readonly VerifyModeItem[];
