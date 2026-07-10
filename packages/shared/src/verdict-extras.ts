import type { RiskLevel, VerdictLevel } from './verdict.js';

/**
 * Libellés produit (français) des niveaux de risque. La valeur machine
 * (`LOW`/`MEDIUM`/`HIGH`/`CRITICAL`) circule sur le réseau ; ces libellés ne
 * servent qu'à l'affichage.
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'faible',
  MEDIUM: 'moyen',
  HIGH: 'élevé',
  CRITICAL: 'critique',
};

/** Champs du verdict étendu, tous garantis présents une fois dérivés. */
export interface VerdictExtras {
  readonly risk_level: RiskLevel;
  readonly score: number;
  readonly senior_summary: string;
  readonly do_not: string;
}

/** Phrase très simple, pensée pour une personne âgée, par niveau de verdict. */
const SENIOR_SUMMARY: Record<VerdictLevel, string> = {
  ARNAQUE_PROBABLE:
    'C’est très probablement une arnaque. Ne réponds pas, ne clique sur rien, et n’envoie ni argent ni code.',
  SUSPECT:
    'C’est peut-être une arnaque. Dans le doute, ne fais rien et demande à un proche de confiance.',
  PLUTOT_SUR:
    'Rien d’inquiétant n’a été repéré. Reste quand même prudent, surtout si on te demande de l’argent.',
  INDETERMINE:
    'Je ne suis pas sûr. Par sécurité, ne fais rien pour l’instant et demande à un proche.',
};

/** L'action à NE SURTOUT PAS faire, par niveau de verdict. */
const DO_NOT: Record<VerdictLevel, string> = {
  ARNAQUE_PROBABLE:
    'Ne clique sur aucun lien et ne communique jamais tes codes ni tes coordonnées bancaires.',
  SUSPECT: 'Ne communique aucun code reçu par SMS, mot de passe, ni numéro de carte.',
  PLUTOT_SUR: 'Ne baisse pas complètement ta garde : ne donne jamais un code reçu par SMS.',
  INDETERMINE:
    'Ne transmets aucune information personnelle ou bancaire tant que tu n’es pas sûr.',
};

/** Niveau de risque de base par verdict (relevé à CRITICAL si confiance très haute). */
const RISK_BY_VERDICT: Record<VerdictLevel, RiskLevel> = {
  ARNAQUE_PROBABLE: 'HIGH',
  SUSPECT: 'MEDIUM',
  INDETERMINE: 'MEDIUM',
  PLUTOT_SUR: 'LOW',
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function deriveRiskLevel(verdict: VerdictLevel, confidence: number): RiskLevel {
  if (verdict === 'ARNAQUE_PROBABLE' && confidence >= 0.9) {
    return 'CRITICAL';
  }
  return RISK_BY_VERDICT[verdict];
}

/** Score de danger 0–100 (plus haut = plus dangereux), borné par bandes cohérentes. */
function deriveScore(verdict: VerdictLevel, confidence: number): number {
  const c = Math.max(0, Math.min(1, confidence));
  switch (verdict) {
    case 'ARNAQUE_PROBABLE':
      return clamp(70 + c * 30, 75, 100);
    case 'SUSPECT':
      return clamp(40 + c * 35, 45, 70);
    case 'PLUTOT_SUR':
      return clamp((1 - c) * 30, 0, 25);
    case 'INDETERMINE':
      return 50;
  }
}

/**
 * Dérive le format de verdict étendu à partir du verdict de base. Utilisé
 * par le serveur pour remplir les champs quand le modèle ne les fournit pas,
 * afin que le contrat soit toujours complet et cohérent.
 */
export function deriveVerdictExtras(verdict: VerdictLevel, confidence: number): VerdictExtras {
  return {
    risk_level: deriveRiskLevel(verdict, confidence),
    score: deriveScore(verdict, confidence),
    senior_summary: SENIOR_SUMMARY[verdict],
    do_not: DO_NOT[verdict],
  };
}
