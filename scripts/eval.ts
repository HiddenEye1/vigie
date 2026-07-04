/**
 * Évaluation du moteur d'analyse (§13) : envoie les 20 exemples de
 * fixtures/samples/ à l'API et affiche la matrice attendu / obtenu.
 *
 * Critère bloquant : AUCUNE arnaque du jeu ne doit être classée PLUTOT_SUR
 * (les faux positifs sur les messages légitimes sont tolérés en v1).
 * Le critère n'est appliqué strictement qu'en mode IA réel : en mode mock,
 * le résultat est indicatif (calibrage du prompt = BACKLOG #5).
 *
 * Usage :
 *   npm run eval                     # API sur http://localhost:3000
 *   npm run eval -- --api http://autre-hote:3000
 *
 * NB : pensez à lancer l'API avec des limites élargies, sinon 429 :
 *   RATE_LIMIT_PER_HOUR=100 RATE_LIMIT_PER_DAY=200 npm run dev -w @vigie/api
 */
import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { analyzeResponseSchema, type VerdictLevel } from '@vigie/shared';
import { z } from 'zod';

const fixtureSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.literal('text'),
  expected: z.enum(['scam', 'legitimate', 'ambiguous']),
  content: z.string().min(20),
});
type Fixture = z.infer<typeof fixtureSchema>;

const EXPECTED_LABELS: Record<Fixture['expected'], string> = {
  scam: 'ARNAQUE',
  legitimate: 'LÉGITIME',
  ambiguous: 'AMBIGU',
};

function apiBase(): string {
  const index = process.argv.indexOf('--api');
  const value = index !== -1 ? process.argv[index + 1] : undefined;
  return (value ?? 'http://localhost:3000').replace(/\/+$/, '');
}

interface RowResult {
  readonly fixture: Fixture;
  readonly verdict: VerdictLevel | 'ERREUR';
  readonly detail: string;
  readonly falseNegative: boolean;
  readonly mismatch: boolean;
}

async function loadFixtures(): Promise<Fixture[]> {
  const dir = path.join(process.cwd(), 'fixtures', 'samples');
  const files = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
  const fixtures: Fixture[] = [];
  for (const file of files) {
    const raw: unknown = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
    fixtures.push(fixtureSchema.parse(raw));
  }
  return fixtures;
}

async function fetchAiMode(base: string): Promise<string> {
  try {
    const response = await fetch(`${base}/v1/health`);
    const body: unknown = await response.json();
    const parsed = z.object({ ai_mode: z.string() }).safeParse(body);
    return parsed.success ? parsed.data.ai_mode : 'inconnu';
  } catch {
    return 'inaccessible';
  }
}

async function evaluate(base: string, fixture: Fixture): Promise<RowResult> {
  try {
    const response = await fetch(`${base}/v1/analyze`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind: 'text',
        content: fixture.content,
        device_id: randomUUID(),
      }),
    });
    if (!response.ok) {
      return {
        fixture,
        verdict: 'ERREUR',
        detail: `HTTP ${String(response.status)}`,
        falseNegative: fixture.expected === 'scam',
        mismatch: true,
      };
    }
    const body: unknown = await response.json();
    const parsed = analyzeResponseSchema.parse(body);
    const falseNegative = fixture.expected === 'scam' && parsed.verdict === 'PLUTOT_SUR';
    const mismatch =
      falseNegative || (fixture.expected === 'legitimate' && parsed.verdict !== 'PLUTOT_SUR');
    return { fixture, verdict: parsed.verdict, detail: parsed.category, falseNegative, mismatch };
  } catch (error) {
    return {
      fixture,
      verdict: 'ERREUR',
      detail: (error as Error).message.slice(0, 60),
      falseNegative: fixture.expected === 'scam',
      mismatch: true,
    };
  }
}

function pad(value: string, width: number): string {
  return value.length >= width ? value.slice(0, width) : value.padEnd(width);
}

async function main(): Promise<void> {
  const base = apiBase();
  const aiMode = await fetchAiMode(base);
  if (aiMode === 'inaccessible') {
    console.error(`API injoignable sur ${base}. Démarrez-la d'abord :`);
    console.error('  RATE_LIMIT_PER_HOUR=100 RATE_LIMIT_PER_DAY=200 npm run dev -w @vigie/api');
    process.exitCode = 1;
    return;
  }

  const fixtures = await loadFixtures();
  console.log(
    `\nÉvaluation Vigie — ${String(fixtures.length)} exemples — API ${base} (mode IA : ${aiMode})\n`,
  );
  console.log(
    `${pad('EXEMPLE', 28)} ${pad('ATTENDU', 10)} ${pad('OBTENU', 18)} ${pad('CATÉGORIE', 26)} STATUT`,
  );
  console.log('-'.repeat(96));

  const results: RowResult[] = [];
  for (const fixture of fixtures) {
    const row = await evaluate(base, fixture);
    results.push(row);
    const status = row.falseNegative ? '❌ FAUX NÉGATIF' : row.mismatch ? '⚠️  écart toléré' : '✅';
    console.log(
      `${pad(row.fixture.id, 28)} ${pad(EXPECTED_LABELS[row.fixture.expected], 10)} ${pad(row.verdict, 18)} ${pad(row.detail, 26)} ${status}`,
    );
  }

  const scams = results.filter((r) => r.fixture.expected === 'scam');
  const falseNegatives = scams.filter((r) => r.falseNegative);
  const legit = results.filter((r) => r.fixture.expected === 'legitimate');
  const falsePositives = legit.filter((r) => r.mismatch);

  console.log('-'.repeat(96));
  console.log(
    `Arnaques détectées   : ${String(scams.length - falseNegatives.length)}/${String(scams.length)}`,
  );
  console.log(`Faux négatifs        : ${String(falseNegatives.length)} (critère §13 : 0 exigé)`);
  console.log(
    `Faux positifs légit. : ${String(falsePositives.length)}/${String(legit.length)} (tolérés en v1)`,
  );

  if (falseNegatives.length > 0) {
    if (aiMode === 'mock') {
      console.log(
        '\n⚠️  Faux négatifs en MODE MOCK : résultat indicatif seulement. Le critère §13\n' +
          '    s’applique au moteur réel (MOCK_AI=false) lors du calibrage (BACKLOG #5).',
      );
    } else {
      console.error('\n❌ ÉCHEC : au moins une arnaque du jeu est classée PLUTOT_SUR (§13).');
      process.exitCode = 1;
      return;
    }
  } else {
    console.log('\n✅ Critère §13 respecté : aucune arnaque du jeu classée PLUTOT_SUR.');
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
