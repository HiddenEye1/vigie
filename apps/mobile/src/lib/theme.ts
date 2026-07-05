import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Thème « Le phare » — identité visuelle unique de Vigie.
 *
 * Métaphore : un phare de poche, calme et solide, qui s'illumine pour signaler
 * le danger. Encre marine pour la structure, brume pour le fond, écume pour
 * les surfaces, laiton (cuivre d'instruments de marine) en accent rare.
 * Les « feux » (rouge/ambre/vert/gris) sont réservés EXCLUSIVEMENT aux verdicts.
 *
 * Règle absolue : aucune couleur ni taille en dur dans les composants —
 * tout vient d'ici.
 */

export const palette = {
  /** Textes forts et éléments structurants — jamais de noir pur. */
  encreMarine: '#0E2A3C',
  /** État pressé des surfaces encre-marine. */
  encreMarinePressee: '#28495D',
  /** Fond principal — jamais de blanc pur. */
  brume: '#F6F8FA',
  /** Surfaces de cartes, posées sur la brume. */
  ecume: '#FFFFFF',
  /** Surface intermédiaire (puces, badges, états pressés clairs). */
  surfaceLegere: '#ECF1F5',
  /** Accent premium RARE : lanterne du phare, détails, onboarding. Jamais interactif. */
  laiton: '#C8A24B',
  /** Laiton très pâle pour fonds d'accent discrets (onboarding). */
  laitonPale: '#F3EBD7',
  /** Texte secondaire — AA sur brume et écume. */
  texteSecondaire: '#46606F',
  /** Bordures discrètes. */
  bordure: '#E2E8ED',

  // — Les feux de verdict (pastilles et halos UNIQUEMENT) —
  feuRouge: '#C63D2F',
  feuAmbre: '#D98E04',
  feuVert: '#1E7F4F',
  feuGris: '#8A97A3',
  // — Déclinaisons AA pour du TEXTE posé sur brume/écume —
  texteFeuRouge: '#B02F22',
  texteFeuAmbre: '#8A5A03',
  texteFeuVert: '#1E7F4F',
  texteFeuGris: '#5B6B77',
} as const;

/** Familles chargées via @expo-google-fonts (voir app/_layout.tsx). */
export const fonts = {
  /** Display — titres, verdicts, chiffres : Bricolage Grotesque. */
  display: 'BricolageGrotesque_700Bold',
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  /** Texte courant : Inter. */
  text: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemiBold: 'Inter_600SemiBold',
  textBold: 'Inter_700Bold',
} as const;

/** Échelle typographique (interlignage ≥ 1.45, tailles dynamiques respectées). */
export const type = {
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 41,
    color: palette.encreMarine,
  },
  verdict: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 32,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    lineHeight: 28,
    color: palette.encreMarine,
  },
  body: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 25,
    color: palette.encreMarine,
  },
  bodySecondary: {
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    color: palette.texteSecondaire,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: 13,
    lineHeight: 19,
    color: palette.texteSecondaire,
  },
  button: {
    fontFamily: fonts.textSemiBold,
    fontSize: 17,
    lineHeight: 25,
  },
} as const satisfies Record<string, TextStyle>;

/** Grille de 4 : marges écran 20 (l), gouttières 12 (m), sections 28 (xl). */
export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 20,
  xl: 28,
  xxl: 40,
} as const;

/** Rayons : cartes 16 (l), boutons 14 (m). */
export const radius = {
  s: 10,
  m: 14,
  l: 16,
} as const;

/** Une seule ombre, douce et basse — jamais d'ombres multiples ou colorées. */
export const cardShadow: ViewStyle = {
  shadowColor: palette.encreMarine,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 12,
  shadowOpacity: 0.06,
  elevation: 2,
};

/** Cible tactile minimale (le brief exige ≥ 48 pt, on vise large). */
export const MIN_TOUCH_TARGET = 56;

/**
 * Alias hérités de la première itération — mappés sur la palette du phare.
 * Les écrans migrent progressivement vers `palette`/`type` ; ces alias
 * garantissent qu'aucune couleur hors charte ne subsiste entre-temps.
 */
export const colors = {
  background: palette.brume,
  surface: palette.surfaceLegere,
  card: palette.ecume,
  border: palette.bordure,
  textPrimary: palette.encreMarine,
  textSecondary: palette.texteSecondaire,
  accent: palette.encreMarine,
  accentPressed: palette.encreMarinePressee,
  onAccent: palette.ecume,
  verdictDanger: palette.texteFeuRouge,
  verdictWarning: palette.texteFeuAmbre,
  verdictSafe: palette.texteFeuVert,
  verdictUnknown: palette.texteFeuGris,
} as const;

/** Alias hérités — l'échelle `type` fait foi pour les nouveaux écrans. */
export const fontSize = {
  small: 15,
  body: 17,
  button: 17,
  subtitle: 19,
  title: 28,
  badge: 22,
} as const;
