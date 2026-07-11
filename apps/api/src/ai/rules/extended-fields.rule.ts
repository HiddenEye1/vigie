import type { VerdictExtras } from '@vigie/shared';
import { deriveVerdictExtras } from '@vigie/shared';

import type { PostProcessRule } from './types.js';

/**
 * Complète le format étendu (risk_level, score, senior_summary, do_not) à partir
 * du verdict FINAL. Doit s'exécuter EN DERNIER, une fois que les garde-fous ont
 * arrêté le verdict.
 *
 * Cohérence : si une règle précédente a CHANGÉ le verdict (comparaison avec
 * `original`), les champs fournis par le fournisseur décrivaient l'ancien
 * verdict et sont entièrement recalculés — sinon on afficherait un « risque
 * faible » sur un verdict devenu suspect. Sinon, on respecte les champs déjà
 * fournis et on ne dérive que les manquants.
 */
export const extendedFieldsRule: PostProcessRule = {
  name: 'extended-fields',
  apply(current, { original }) {
    const derived = deriveVerdictExtras(current.verdict, current.confidence);
    const verdictChanged = current.verdict !== original.verdict;

    const extras: VerdictExtras = verdictChanged
      ? derived
      : {
          risk_level: current.risk_level ?? derived.risk_level,
          score: current.score ?? derived.score,
          senior_summary: current.senior_summary ?? derived.senior_summary,
          do_not: current.do_not ?? derived.do_not,
        };

    return {
      patch: extras,
      reason: verdictChanged
        ? 'verdict modifié par un garde-fou : champs étendus recalculés'
        : 'champs étendus complétés à partir du verdict',
    };
  },
};
