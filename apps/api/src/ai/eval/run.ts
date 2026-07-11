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
 * Option --only=id1,id2,… : restreint l'évaluation à un sous-ensemble d'ids du
 * corpus (échantillon réduit). Sans cette option, tout le corpus est évalué.
 * En mode réel, c'est le garde-fou de budget : autant d'appels que d'ids listés.
 *
 * Usage :
 *   npm run eval:corpus -w @vigie/api
 *   ANTHROPIC_API_KEY=... npm run eval:corpus -w @vigie/api -- --real --only=danger-crypto,legit-remboursement-proche
 */
import process from 'node:process';

import { AnthropicProvider } from '../anthropic-provider.js';
import { finalizeVerdict } from '../post-process.js';
import type { AIProvider } from '../provider.js';
import { buildInput, type CorpusCase, loadCorpus } from './corpus.js';
import { mockProvider } from './corpus.js';

function useReal(): boolean {
  return process.argv.includes('--real');
}

/** Ids retenus via --only=…, ou null si l'option est absente (tout le corpus). */
function onlyIds(): ReadonlySet<string> | null {
  const flag = process.argv.find((arg) => arg.startsWith('--only='));
  if (!flag) {
    return null;
  }
  const ids = flag
    .slice('--only='.length)
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  return new Set(ids);
}

/** Applique le filtre --only et signale les ids demandés mais introuvables. */
function selectCorpus(): CorpusCase[] {
  const all = loadCorpus();
  const ids = onlyIds();
  if (!ids) {
    return all;
  }
  const known = new Set(all.map((testCase) => testCase.id));
  const missing = [...ids].filter((id) => !known.has(id));
  if (missing.length > 0) {
    throw new Error(`--only : ids introuvables dans le corpus : ${missing.join(', ')}`);
  }
  return all.filter((testCase) => ids.has(testCase.id));
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

/** Champs étendus bruts du fournisseur (ou marqueur s'ils n'ont pas été fournis). */
function rawExtras(risk: string | undefined, score: number | undefined): string {
  if (risk === undefined && score === undefined) {
    return '(non fournis par le modèle)';
  }
  return `${risk ?? '—'} / score ${score === undefined ? '—' : String(score)}`;
}

async function main(): Promise<void> {
  const corpus = selectCorpus();
  const provider = selectProvider();
  const mode = useReal() ? 'IA RÉELLE (Anthropic, réseau)' : 'mock + règles (indicatif)';

  console.log(`\nÉvaluation du corpus — ${String(corpus.length)} cas — mode : ${mode}\n`);
  console.log(
    `${pad('ID', 34)} ${pad('NATURE', 11)} ${pad('OBTENU', 18)} ${pad('RISQUE', 9)} STATUT`,
  );
  console.log('-'.repeat(92));

  let inRange = 0;
  const failures: string[] = [];
  const details: string[] = [];

  for (const testCase of corpus) {
    const input = buildInput(testCase);
    // Avant / après post-process : on capture le verdict BRUT du fournisseur
    // puis le verdict FINAL (règles serveur appliquées).
    const raw = await provider.analyze(input);
    const final = finalizeVerdict(raw, input);

    const ok =
      testCase.expected_verdicts.includes(final.verdict) &&
      testCase.expected_risk.includes(final.risk_level);
    if (ok) {
      inRange += 1;
    } else {
      failures.push(
        `${testCase.id} (${testCase.nature}) : obtenu ${final.verdict}/${final.risk_level}, ` +
          `attendu ${testCase.expected_verdicts.join('|')} / ${testCase.expected_risk.join('|')}`,
      );
    }

    console.log(
      `${pad(testCase.id, 34)} ${pad(testCase.nature, 11)} ${pad(final.verdict, 18)} ${pad(final.risk_level, 9)} ${ok ? '✅' : '⚠️'}`,
    );

    details.push(
      [
        `\n■ ${testCase.id}  [${testCase.nature}]  ${ok ? '✅' : '⚠️'}`,
        `   attendu       : verdict ${testCase.expected_verdicts.join('|')} · risque ${testCase.expected_risk.join('|')}`,
        `   AVANT post-tt : ${raw.verdict} · cat ${raw.category} · ${rawExtras(raw.risk_level, raw.score)}`,
        `   APRÈS post-tt : ${final.verdict} · cat ${final.category} · ${final.risk_level} / score ${String(final.score)}`,
        `   senior_summary: ${final.senior_summary}`,
        `   do_not        : ${final.do_not}`,
      ].join('\n'),
    );
  }

  console.log('-'.repeat(92));
  console.log(`Dans la plage attendue : ${String(inRange)}/${String(corpus.length)}`);

  console.log('\n=== Détail par cas (avant / après post-traitement) ===');
  for (const block of details) {
    console.log(block);
  }

  if (failures.length > 0) {
    console.log(`\n=== Écarts à examiner (${String(failures.length)}) ===`);
    for (const failure of failures) {
      console.log(`   ⚠️  ${failure}`);
    }
  } else {
    console.log('\nAucun écart de verdict/risque par rapport aux plages attendues.');
  }

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
