import type { ScamCategory, VerdictLevel } from '@vigie/shared';

import type { PostProcessRule } from './types.js';

/** Sévérité croissante d'un verdict, pour comparer sans jamais rétrograder. */
const VERDICT_SEVERITY: Record<VerdictLevel, number> = {
  PLUTOT_SUR: 0,
  INDETERMINE: 1,
  SUSPECT: 2,
  ARNAQUE_PROBABLE: 3,
};

/**
 * Plancher de verdict par catégorie DÉFINITIONNELLEMENT frauduleuse : si le
 * modèle a rangé le message dans l'une de ces catégories, un verdict rassurant
 * (ou seulement indéterminé) est incohérent. AUTRE et AUCUNE sont volontairement
 * absentes (catégories neutres) pour ne pas surclasser des messages légitimes.
 */
const CATEGORY_VERDICT_FLOOR: Partial<Record<ScamCategory, VerdictLevel>> = {
  // Fraudes à fort préjudice financier ou manipulation directe.
  FAUX_CONSEILLER_BANCAIRE: 'ARNAQUE_PROBABLE',
  FAUX_SUPPORT_TECHNIQUE: 'ARNAQUE_PROBABLE',
  INVESTISSEMENT_FRAUDULEUX: 'ARNAQUE_PROBABLE',
  FRAUDE_CPF_AIDES: 'ARNAQUE_PROBABLE',
  CHANTAGE_SEXTORSION: 'ARNAQUE_PROBABLE',
  // Autres arnaques nommées : au minimum « suspect », jamais rassurant.
  PHISHING_COLIS: 'SUSPECT',
  PHISHING_ADMINISTRATION: 'SUSPECT',
  ARNAQUE_PETITES_ANNONCES: 'SUSPECT',
  ARNAQUE_SENTIMENTALE: 'SUSPECT',
  FAUX_SITE_ECOMMERCE: 'SUSPECT',
  ARNAQUE_EMPLOI: 'SUSPECT',
  SMISHING_AUTRE: 'SUSPECT',
};

const COHERENCE_REASON =
  'Ce message correspond à un type d’arnaque connu : par prudence, il ne peut pas être présenté comme sûr.';

/**
 * Cohérence catégorie ↔ verdict. Filet DÉFENSIF : si le modèle a assigné une
 * catégorie clairement frauduleuse mais rendu un verdict trop rassurant, on
 * relève le verdict jusqu'au plancher de la catégorie. On ne RÉTROGRADE jamais.
 *
 * Garde-fou anti-faux-positifs : quand la confiance est faible (< 0.5), on ne
 * dépasse pas SUSPECT — on refuse de présenter une catégorie dangereuse comme
 * sûre, sans pour autant sur-affirmer « arnaque probable » sur une
 * classification incertaine (cohérent avec la dégradation de confiance §4.2).
 *
 * Doit s'exécuter APRÈS l'anti-injection et AVANT extended-fields, pour que les
 * champs étendus soient recalculés à partir du verdict relevé.
 */
export const categoryCoherenceRule: PostProcessRule = {
  name: 'category-coherence',
  apply(current) {
    const floor = CATEGORY_VERDICT_FLOOR[current.category];
    if (floor === undefined) {
      return null;
    }

    // Sur une classification peu sûre, on plafonne le relèvement à SUSPECT.
    const target =
      current.confidence < 0.5 && VERDICT_SEVERITY[floor] > VERDICT_SEVERITY.SUSPECT
        ? 'SUSPECT'
        : floor;

    if (VERDICT_SEVERITY[current.verdict] >= VERDICT_SEVERITY[target]) {
      return null;
    }

    return {
      patch: { verdict: target, reasons: [...current.reasons, COHERENCE_REASON] },
      reason: `catégorie ${current.category} : verdict relevé de ${current.verdict} à ${target}`,
    };
  },
};
