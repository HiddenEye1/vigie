import type { AnalyzeResponse } from '@vigie/shared';

import { EXCERPT_MAX_LENGTH, HISTORY_LIMIT, useHistory } from './history';

function makeResult(id: string): AnalyzeResponse {
  return {
    verdict: 'SUSPECT',
    confidence: 0.7,
    category: 'SMISHING_AUTRE',
    summary: 'Plusieurs éléments de ce message sont inhabituels.',
    reasons: ['Urgence artificielle.'],
    actions: ['Ne cliquez pas.'],
    url_analysis: null,
    request_id: id,
  };
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

describe('useHistory (§8.2)', () => {
  beforeEach(() => {
    useHistory.getState().clear();
  });

  it('ajoute une entrée avec extrait tronqué à 200 caractères', () => {
    const longText = 'a'.repeat(500);
    const entry = useHistory.getState().add({
      kind: 'text',
      excerpt: longText,
      result: makeResult(uuid(1)),
    });
    expect(entry.excerpt).toHaveLength(EXCERPT_MAX_LENGTH);
    expect(useHistory.getState().entries).toHaveLength(1);
  });

  it('les entrées les plus récentes sont en tête', () => {
    const state = useHistory.getState();
    state.add({ kind: 'text', excerpt: 'premier', result: makeResult(uuid(1)) });
    state.add({ kind: 'text', excerpt: 'second', result: makeResult(uuid(2)) });
    expect(useHistory.getState().entries[0]?.excerpt).toBe('second');
  });

  it('plafonne à 200 entrées (FIFO)', () => {
    const state = useHistory.getState();
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) {
      state.add({ kind: 'text', excerpt: `message ${String(i)}`, result: makeResult(uuid(i)) });
    }
    const entries = useHistory.getState().entries;
    expect(entries).toHaveLength(HISTORY_LIMIT);
    // La plus ancienne (message 0..4) a été évincée, la plus récente est présente.
    expect(entries[0]?.excerpt).toBe(`message ${String(HISTORY_LIMIT + 4)}`);
    expect(entries.some((e) => e.excerpt === 'message 0')).toBe(false);
  });

  it('la purge vide tout', () => {
    const state = useHistory.getState();
    state.add({ kind: 'text', excerpt: 'x', result: makeResult(uuid(1)) });
    state.clear();
    expect(useHistory.getState().entries).toHaveLength(0);
  });
});
