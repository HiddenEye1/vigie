import { ADVICE_REQUESTS_LIMIT, useAdviceRequests } from './advice-requests.store';

afterEach(() => {
  useAdviceRequests.setState({ entries: [] });
});

describe('advice-requests store', () => {
  it('ajoute une demande, la plus récente d’abord', () => {
    useAdviceRequests.getState().add({ contactFirstName: 'Marie', situation: 'aide' });
    useAdviceRequests.getState().add({
      contactFirstName: 'Paul',
      situation: 'message',
      verdict: 'ARNAQUE_PROBABLE',
      category: 'PHISHING_COLIS',
    });
    const { entries } = useAdviceRequests.getState();
    expect(entries).toHaveLength(2);
    expect(entries[0]?.contactFirstName).toBe('Paul');
    expect(entries[0]?.verdict).toBe('ARNAQUE_PROBABLE');
    expect(entries[0]?.category).toBe('PHISHING_COLIS');
    expect(entries[1]?.contactFirstName).toBe('Marie');
    expect(entries[1]?.verdict).toBeUndefined();
  });

  it('n’enregistre pas la catégorie neutre AUCUNE', () => {
    useAdviceRequests.getState().add({
      contactFirstName: 'Marie',
      situation: 'message',
      verdict: 'PLUTOT_SUR',
      category: 'AUCUNE',
    });
    expect(useAdviceRequests.getState().entries[0]?.category).toBeUndefined();
  });

  it('ne stocke que des champs non sensibles (jamais contenu / raisons / actions / score)', () => {
    useAdviceRequests.getState().add({
      contactFirstName: 'Marie',
      situation: 'message',
      verdict: 'SUSPECT',
      category: 'SMISHING_AUTRE',
    });
    const entry = useAdviceRequests.getState().entries[0];
    expect(Object.keys(entry ?? {}).sort()).toEqual(
      ['category', 'contactFirstName', 'date', 'id', 'situation', 'verdict'].sort(),
    );
  });

  it('plafonne à 30 entrées, en gardant les plus récentes', () => {
    for (let i = 0; i < 35; i += 1) {
      useAdviceRequests.getState().add({ contactFirstName: `P${String(i)}`, situation: 'aide' });
    }
    const { entries } = useAdviceRequests.getState();
    expect(entries).toHaveLength(ADVICE_REQUESTS_LIMIT);
    expect(entries[0]?.contactFirstName).toBe('P34');
  });

  it('clear vide la liste', () => {
    useAdviceRequests.getState().add({ contactFirstName: 'Marie', situation: 'aide' });
    useAdviceRequests.getState().clear();
    expect(useAdviceRequests.getState().entries).toHaveLength(0);
  });
});
