import type { AIVerdict, AnalyzeInput } from '../provider.js';

/** Verdict brut de base pour les tests de règles (surchargé au besoin). */
export function makeVerdict(overrides: Partial<AIVerdict> = {}): AIVerdict {
  return {
    verdict: 'PLUTOT_SUR',
    confidence: 0.9,
    category: 'AUCUNE',
    summary: 'Ce message ne présente aucun signal d’arnaque.',
    reasons: ['Aucune demande de données personnelles.'],
    actions: ['Restez vigilant.'],
    ...overrides,
  };
}

export function makeInput(content: string): AnalyzeInput {
  return { kind: 'text', content };
}
