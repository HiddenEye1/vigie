import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Thème « Gardien / la veille radar » — identité visuelle unique de Vigie.
 *
 * Métaphore : un poste de veille dans la nuit. Fond bleu nuit, surfaces ardoise,
 * un radar ambiant qui balaie, et le laiton (cuivre d'instruments de marine)
 * en accent RARE — contours et détails, aplat réservé à l'action du moment.
 * Les « feux » (rouge/ambre/vert/gris) lumineux sont réservés aux verdicts.
 *
 * Règle absolue : aucune couleur ni taille en dur dans les composants —
 * tout vient d'ici, pour pouvoir réajuster une teinte à un seul endroit.
 */

export const palette = {
  // — Fonds : le bleu nuit —
  /** Fond principal de l'app. */
  nuit: '#0A1F2E',
  /** Haut de dégradé (un souffle plus clair). */
  nuitHaute: '#0D2436',
  /** Bas de dégradé / creux profond. */
  nuitProfonde: '#081A27',

  // — Surfaces : l'ardoise —
  /** Surfaces de cartes, champs, tuiles. */
  ardoise: '#16304A',
  /** Surface active / pressée / pilule d'onglet active. */
  ardoiseElevee: '#1E3A52',
  /** Champ héros — un cran plus sombre que la carte. */
  ardoiseHaute: '#13293D',
  /** Filets et contours discrets. */
  bordure: '#294B67',
  /** Filet plus doux, presque fondu. */
  bordureDouce: '#1E3A52',

  // — Accent laiton : RARE —
  /** Laiton : contours, détails, aplat sur l'action du moment uniquement. */
  laiton: '#C8A24B',
  /** Laiton clair (survol / pression sur aplat laiton). */
  laitonClair: '#D9B968',
  /** Voile de laiton pour fonds d'accent discrets. */
  laitonPale: 'rgba(200, 162, 75, 0.14)',
  /** Filet de laiton (hairline sur les champs). */
  laitonFilet: 'rgba(200, 162, 75, 0.30)',

  // — Texte : blanc cassé chaud —
  /** Texte principal — jamais de blanc pur. */
  texteClair: '#F2F4F5',
  /** Texte secondaire — AA sur nuit et ardoise. */
  texteDoux: '#9DB2C4',
  /** Texte tertiaire / légendes. */
  texteMuet: '#7C93A6',

  // — Les feux de verdict (pastilles et halos), lumineux sur la nuit —
  feuRouge: '#E5564A',
  feuAmbre: '#F0A83C',
  feuVert: '#35B37E',
  feuGris: '#8AA0B2',
  // — Déclinaisons plus claires pour du TEXTE posé sur nuit/ardoise —
  texteFeuRouge: '#F08379',
  texteFeuAmbre: '#F0BE6B',
  texteFeuVert: '#5FCE9E',
  texteFeuGris: '#B4C4D2',
  // — Glyphe posé SUR un feu plein (pastille) —
  surFeuClair: '#FBF3E7',
  surFeuSombre: '#0A1F2E',

  // ————————————————————————————————————————————————————————————————
  // Alias hérités — mappés sur la nuit pour que les écrans non encore
  // migrés restent cohérents (surfaces sombres, texte clair) sans casser.
  // Les nouveaux écrans utilisent directement les tokens ci-dessus.
  // ————————————————————————————————————————————————————————————————
  /** = nuit (fond d'écran). */
  brume: '#0A1F2E',
  /** = ardoise (surface de carte). */
  ecume: '#16304A',
  /** = ardoiseElevee (surface intermédiaire / pressée). */
  surfaceLegere: '#1E3A52',
  /** Structure foncée : fond d'en-tête ancré, reste sombre. */
  encreMarine: '#0C2233',
  /** État pressé des surfaces encre-marine. */
  encreMarinePressee: '#123049',
  /** = texteDoux (texte secondaire). */
  texteSecondaire: '#9DB2C4',
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
    color: palette.texteClair,
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
    color: palette.texteClair,
  },
  body: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 25,
    color: palette.texteClair,
  },
  bodySecondary: {
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    color: palette.texteDoux,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: 13,
    lineHeight: 19,
    color: palette.texteDoux,
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

/** Rayons : cartes 16 (l), boutons 14 (m), en-tête / champ héros 24 (xl). */
export const radius = {
  s: 10,
  m: 14,
  l: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Sur l'en-tête encre-marine foncé, le texte est clair. Déclinaisons dédiées
 * pour garder le contraste AA sur ce fond.
 */
export const onHeader = {
  /** Texte principal sur l'en-tête (blanc cassé chaud). */
  text: '#F2F4F5',
  /** Texte secondaire sur l'en-tête (bleu-gris clair, AA). */
  textMuted: '#9DB2C4',
  /** Surface légère posée sur l'en-tête (puce d'engrenage, etc.). */
  surface: 'rgba(242, 244, 245, 0.10)',
} as const;

/**
 * Le radar ambiant et les halos de verdict — teintes et rythmes centralisés
 * pour que la « veille » respire de la même façon partout.
 */
export const veille = {
  /** Teinte du radar ambiant de l'accueil (laiton très voilé). */
  radar: 'rgba(200, 162, 75, 0.16)',
  /** Trait des anneaux fixes du radar. */
  radarAnneau: 'rgba(157, 178, 196, 0.14)',
  /** Point « en veille / en direct » (vert vivant). */
  pointVeille: '#35B37E',
  /** Durée d'un balayage de radar (ms). */
  balayageMs: 6000,
  /** Durée d'une impulsion d'anneau (ms). */
  pulseMs: 4500,
  /** Durée d'un battement de halo de verdict (ms). */
  haloMs: 3200,
} as const;

/** Une seule ombre, profonde et basse — portée par la nuit, jamais colorée. */
export const cardShadow: ViewStyle = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 16,
  shadowOpacity: 0.28,
  elevation: 6,
};

/** Cible tactile minimale (le brief exige ≥ 48 pt, on vise large). */
export const MIN_TOUCH_TARGET = 56;

/**
 * Mode simplifié (senior) : typographie nettement agrandie, cibles tactiles
 * très grandes, contrastes renforcés (le texte secondaire passe en texte clair
 * plutôt qu'en gris doux). Un seul geste dominant par écran.
 */
export const simple = {
  /** Hauteur d'un grand bouton — bien au-delà des 48 pt réglementaires. */
  cible: 104,
  /** Taille des icônes des grands boutons. */
  icone: 32,
  titre: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 44,
    color: palette.texteClair,
  },
  sousTitre: {
    fontFamily: fonts.text,
    fontSize: 19,
    lineHeight: 28,
    // Contraste renforcé : on n'utilise PAS le gris doux ici.
    color: palette.texteClair,
  },
  bouton: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  lienDiscret: {
    fontFamily: fonts.textSemiBold,
    fontSize: 17,
    lineHeight: 25,
    color: palette.texteDoux,
  },
} as const;

/**
 * Alias hérités de la première itération — mappés sur la palette de la nuit.
 * Les écrans migrent progressivement vers `palette`/`type` ; ces alias
 * garantissent qu'aucune couleur hors charte ne subsiste entre-temps.
 */
export const colors = {
  background: palette.nuit,
  surface: palette.ardoiseElevee,
  card: palette.ardoise,
  border: palette.bordure,
  textPrimary: palette.texteClair,
  textSecondary: palette.texteDoux,
  accent: palette.laiton,
  accentPressed: palette.laitonClair,
  onAccent: palette.surFeuSombre,
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
