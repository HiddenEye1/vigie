import type { Ionicons } from '@expo/vector-icons';

export type VerifyMode = 'texte' | 'capture' | 'lien' | 'mail';

export interface VerifyModeItem {
  readonly key: VerifyMode;
  readonly label: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly route: '/verifier-texte' | '/verifier-capture' | '/verifier-lien' | '/verifier-mail';
}

/**
 * Les modes de vérification, partagés entre l'accueil et les écrans de saisie
 * pour garantir les mêmes onglets partout (une seule source de vérité).
 */
export const VERIFY_MODES = [
  { key: 'texte', label: 'Message', icon: 'chatbubble-ellipses-outline', route: '/verifier-texte' },
  { key: 'capture', label: 'Capture', icon: 'image-outline', route: '/verifier-capture' },
  { key: 'lien', label: 'Lien', icon: 'link-outline', route: '/verifier-lien' },
  { key: 'mail', label: 'Mail', icon: 'mail-outline', route: '/verifier-mail' },
] as const satisfies readonly VerifyModeItem[];
