import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { VerdictExtras } from '@vigie/shared';
import { riskLevelSchema, scamCategorySchema, verdictLevelSchema } from '@vigie/shared';
import { z } from 'zod';

import { MockProvider } from '../mock-provider.js';
import { finalizeVerdict } from '../post-process.js';
import type { AIProvider, AIVerdict, AnalyzeInput } from '../provider.js';

/**
 * Corpus d'évaluation local (§13, élargi). Cas dangereux, ambigus, légitimes et
 * de prévention, versionnés dans `fixtures/corpus.json`. Aucune donnée
 * personnelle réelle, aucun secret, aucun appel réseau.
 *
 * Deux façons de mesurer, car le MockProvider n'est PAS un classifieur (il
 * matche des mots-clés) :
 *  - pipeline complet (mock → finalizeVerdict) : pertinent pour les cas DANGER,
 *    où le scénario mock approxime ce qu'un vrai modèle dirait ;
 *  - règles seules (base bénigne → finalizeVerdict) : pertinent pour l'ANTI
 *    FAUX-POSITIF, car cela isole le comportement des règles des faux positifs
 *    « mots-clés » du mock. C'est la garantie « Vigie ne crie pas à l'arnaque
 *    sur tout ».
 */

const urlSignalsSchema = z.object({
  finalUrl: z.string().min(1),
  https: z.boolean(),
  redirects: z.number().int().min(0),
  domainAgeDays: z.number().int().min(0).nullable(),
  isOfficialDomain: z.boolean(),
  pageTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  fetchFailed: z.boolean(),
});

export const CORPUS_NATURES = ['danger', 'ambigu', 'legitime', 'prevention'] as const;

export const corpusCaseSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    kind: z.enum(['text', 'url']),
    nature: z.enum(CORPUS_NATURES),
    content: z.string().min(1),
    expected_verdicts: z.array(verdictLevelSchema).min(1),
    expected_risk: z.array(riskLevelSchema).min(1),
    expected_category: scamCategorySchema.optional(),
    why: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    urlSignals: urlSignalsSchema.optional(),
  })
  .refine((c) => c.kind !== 'url' || c.urlSignals !== undefined, {
    message: 'un cas de type "url" doit fournir urlSignals',
  });

export type CorpusCase = z.infer<typeof corpusCaseSchema>;

/** Chemin du corpus, résolu depuis ce module (indépendant du cwd). */
function corpusPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../../../../fixtures/corpus.json');
}

export function loadCorpus(): CorpusCase[] {
  const raw: unknown = JSON.parse(readFileSync(corpusPath(), 'utf8'));
  return z.array(corpusCaseSchema).parse(raw);
}

export function buildInput(testCase: CorpusCase): AnalyzeInput {
  if (testCase.kind === 'url') {
    if (!testCase.urlSignals) {
      throw new Error(`${testCase.id} : urlSignals manquant`);
    }
    return { kind: 'url', content: testCase.content, urlSignals: testCase.urlSignals };
  }
  return { kind: 'text', content: testCase.content };
}

/**
 * Pile complète : verdict du fournisseur (mock ou réel) puis post-traitement.
 * C'est ce que verrait l'utilisateur. Utilisé pour les cas DANGER et par le
 * runner CLI.
 */
export async function evaluatePipeline(
  provider: AIProvider,
  testCase: CorpusCase,
): Promise<AIVerdict & VerdictExtras> {
  const input = buildInput(testCase);
  const raw = await provider.analyze(input);
  return finalizeVerdict(raw, input);
}

/** Base bénigne : « aucun signal détecté ». Sert à mesurer si les RÈGLES escaladent. */
const BENIGN_BASE: AIVerdict = {
  verdict: 'PLUTOT_SUR',
  confidence: 0.9,
  category: 'AUCUNE',
  summary: 'Aucun signal d’arnaque détecté.',
  reasons: ['Aucun signal particulier.'],
  actions: ['Restez vigilant.'],
};

/**
 * Règles seules : applique le post-traitement à une base bénigne. Si le verdict
 * final reste PLUTOT_SUR, c'est qu'aucune règle n'a escaladé ce contenu — la
 * garantie anti-faux-positif.
 */
export function evaluateRulesOnly(testCase: CorpusCase): AIVerdict & VerdictExtras {
  return finalizeVerdict(BENIGN_BASE, buildInput(testCase));
}

/** Fournisseur mock partagé (sans latence) pour les évaluations en local. */
export function mockProvider(): AIProvider {
  return new MockProvider({ delayMs: 0 });
}
