/**
 * Runner d'évaluation LOCAL du corpus (fixtures/corpus.json).
 *
 * Par défaut : mock + règles + post-traitement, EN PROCESSUS, sans réseau et
 * sans appel Anthropic. Le résultat est INDICATIF : le MockProvider matche des
 * mots-clés, il peut donc « surclasser » un message légitime qui contient un
 * mot piège. La garantie anti-faux-positif au niveau des RÈGLES est vérifiée par
 * la suite de tests (corpus.test.ts, méthode « règles seules »).
 *
 * Option --real : passe par le vrai modèle Anthropic (RÉSEAU + coût). Désactivée
 * par défaut. Nécessite ANTHROPIC_API_KEY dans l'environnement.
 *
 * Usage :
 *   npm run eval:corpus -w @vigie/api
 *   ANTHROPIC_API_KEY=... npm run eval:corpus -w @vigie/api -- --real
 */
import process from 'node:process';

import { AnthropicProvider } from '../anthropic-provider.js';
import type { AIProvider } from '../provider.js';
import { evaluatePipeline, loadCorpus } from './corpus.js';
import { mockProvider } from './corpus.js';

function useReal(): boolean {
  return process.argv.includes('--real');
}

function selectProvider(): AIProvider {
  if (!useReal()) {
    return mockProvider();
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('--real exige ANTHROPIC_API_KEY dans l’environnement.');
  }
  return new AnthropicProvider({ apiKey, model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6' });
}

function pad(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : value.padEnd(width);
}

async function main(): Promise<void> {
  const corpus = loadCorpus();
  const provider = selectProvider();
  const mode = useReal() ? 'IA RÉELLE (Anthropic, réseau)' : 'mock + règles (indicatif)';

  console.log(`\nÉvaluation du corpus — ${String(corpus.length)} cas — mode : ${mode}\n`);
  console.log(
    `${pad('ID', 34)} ${pad('NATURE', 11)} ${pad('OBTENU', 18)} ${pad('RISQUE', 9)} STATUT`,
  );
  console.log('-'.repeat(92));

  let inRange = 0;
  for (const testCase of corpus) {
    const final = await evaluatePipeline(provider, testCase);
    const ok =
      testCase.expected_verdicts.includes(final.verdict) &&
      testCase.expected_risk.includes(final.risk_level);
    if (ok) {
      inRange += 1;
    }
    console.log(
      `${pad(testCase.id, 34)} ${pad(testCase.nature, 11)} ${pad(final.verdict, 18)} ${pad(final.risk_level, 9)} ${ok ? '✅' : '⚠️'}`,
    );
  }

  console.log('-'.repeat(92));
  console.log(`Dans la plage attendue : ${String(inRange)}/${String(corpus.length)}`);
  if (!useReal()) {
    console.log(
      '\nMode mock : résultat INDICATIF. Les « écarts » sur des cas légitimes viennent du\n' +
        'matching par mots-clés du mock, pas des règles de Vigie. L’anti-faux-positif au\n' +
        'niveau des règles est garanti par les tests (corpus.test.ts).',
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
