import type { ScamCategory, VerdictLevel } from '@vigie/shared';

import { colors } from './theme';

/** Libellés §4.2 — jamais de pourcentage de confiance affiché. */
export const VERDICT_UI: Record<
  VerdictLevel,
  {
    label: string;
    color: string;
    icon: 'alert-circle' | 'warning' | 'shield-checkmark' | 'help-circle';
  }
> = {
  ARNAQUE_PROBABLE: {
    label: 'Arnaque très probable',
    color: colors.verdictDanger,
    icon: 'alert-circle',
  },
  SUSPECT: {
    label: 'Méfiance, plusieurs signaux d’alerte',
    color: colors.verdictWarning,
    icon: 'warning',
  },
  PLUTOT_SUR: {
    label: 'Aucun signal d’arnaque détecté',
    color: colors.verdictSafe,
    icon: 'shield-checkmark',
  },
  INDETERMINE: {
    label: 'Impossible de me prononcer',
    color: colors.verdictUnknown,
    icon: 'help-circle',
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
