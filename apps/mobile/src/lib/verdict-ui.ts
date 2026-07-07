import type { ScamCategory, VerdictLevel } from '@vigie/shared';

import { palette } from './theme';

/**
 * Les « feux » du phare (§4.2) : chaque verdict est un feu.
 * - `fill` / `onFill` : pastille circulaire (le feu lui-même) ;
 * - `halo` : teinte du halo lumineux derrière la pastille ;
 * - `text` : déclinaison AA pour du texte posé sur brume/écume ;
 * - jamais de pourcentage de confiance affiché.
 */
export interface VerdictUi {
  readonly label: string;
  readonly fill: string;
  readonly onFill: string;
  readonly halo: string;
  readonly text: string;
  readonly icon: 'warning' | 'help' | 'checkmark' | 'remove';
}

export const VERDICT_UI: Record<VerdictLevel, VerdictUi> = {
  ARNAQUE_PROBABLE: {
    label: 'Arnaque très probable',
    fill: palette.feuRouge,
    onFill: palette.surFeuClair,
    halo: palette.feuRouge,
    text: palette.texteFeuRouge,
    icon: 'warning',
  },
  SUSPECT: {
    label: 'Méfiance, plusieurs signaux d’alerte',
    fill: palette.feuAmbre,
    // L'ambre est trop clair pour du blanc : le glyphe passe en bleu nuit (AA).
    onFill: palette.surFeuSombre,
    halo: palette.feuAmbre,
    text: palette.texteFeuAmbre,
    icon: 'help',
  },
  PLUTOT_SUR: {
    label: 'Aucun signal d’arnaque détecté',
    fill: palette.feuVert,
    onFill: palette.surFeuSombre,
    halo: palette.feuVert,
    text: palette.texteFeuVert,
    icon: 'checkmark',
  },
  INDETERMINE: {
    label: 'Impossible de me prononcer',
    fill: palette.feuGris,
    onFill: palette.surFeuSombre,
    halo: palette.feuGris,
    text: palette.texteFeuGris,
    icon: 'remove',
  },
};

/** Libellés français des catégories d'arnaque (badge du verdict). */
export const CATEGORY_LABELS: Record<ScamCategory, string> = {
  FAUX_CONSEILLER_BANCAIRE: 'Faux conseiller bancaire',
  PHISHING_COLIS: 'Faux avis de colis',
  PHISHING_ADMINISTRATION: 'Fausse administration',
  ARNAQUE_PETITES_ANNONCES: 'Arnaque petites annonces',
  ARNAQUE_SENTIMENTALE: 'Arnaque sentimentale',
  FAUX_SUPPORT_TECHNIQUE: 'Faux support technique',
  INVESTISSEMENT_FRAUDULEUX: 'Placement frauduleux',
  FAUX_SITE_ECOMMERCE: 'Faux site de vente',
  CHANTAGE_SEXTORSION: 'Chantage en ligne',
  ARNAQUE_EMPLOI: 'Fausse offre d’emploi',
  FRAUDE_CPF_AIDES: 'Fraude CPF / aides',
  SMISHING_AUTRE: 'SMS frauduleux',
  AUTRE: 'Autre arnaque',
  AUCUNE: 'Aucune catégorie',
};

/** Mention obligatoire sur chaque verdict (§4.2 point 7). */
export const VERDICT_DISCLAIMER =
  'Vigie est une aide à la décision, pas une garantie. En cas de doute sur un paiement, contactez directement votre banque.';
