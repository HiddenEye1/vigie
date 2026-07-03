/**
 * Thème Vigie — sobre, rassurant, institutionnel-moderne (§10).
 * Fond clair, un seul accent (bleu profond) ; les couleurs rouge/orange/vert
 * sont réservées aux pastilles de verdict. Contrastes AA vérifiés sur fond blanc.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#F1F5F9',
  card: '#F8FAFC',
  border: '#CBD5E1',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  accent: '#1D4ED8',
  accentPressed: '#1E3A8A',
  onAccent: '#FFFFFF',
  /** Couleurs de pastille (texte blanc AA sur chacune). */
  verdictDanger: '#B91C1C',
  verdictWarning: '#C2410C',
  verdictSafe: '#15803D',
  verdictUnknown: '#475569',
} as const;

/** Tailles généreuses pour le persona B (§3) : gros textes, zéro loupe nécessaire. */
export const fontSize = {
  small: 15,
  body: 18,
  button: 20,
  subtitle: 20,
  title: 26,
  badge: 22,
} as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

/** Cible tactile minimale de 44 pt (§10) — nos boutons visent large. */
export const MIN_TOUCH_TARGET = 56;

export const radius = {
  s: 8,
  m: 12,
  l: 16,
} as const;
