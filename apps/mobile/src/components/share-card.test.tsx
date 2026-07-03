import type { AnalyzeResponse } from '@vigie/shared';
import { render } from '@testing-library/react-native';

import { ShareCard } from './share-card';

const RESULT: AnalyzeResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.93,
  category: 'PHISHING_COLIS',
  summary: 'C’est la fausse notification de colis classique.',
  reasons: ['Frais réclamés par SMS.', 'Lien non officiel.'],
  actions: ['Ne cliquez pas.', 'Transférez au 33700.'],
  url_analysis: null,
  request_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
};

/** §8.4 : la carte contient logo, pastille, catégorie, résumé — rien d'autre. */
describe('ShareCard', () => {
  it('affiche le nom, la pastille, la catégorie et le résumé', async () => {
    const view = await render(<ShareCard result={RESULT} />);
    expect(view.getByText('Vigie')).toBeTruthy();
    expect(view.getByText('Arnaque très probable')).toBeTruthy();
    expect(view.getByText('Faux avis de colis')).toBeTruthy();
    expect(view.getByText('C’est la fausse notification de colis classique.')).toBeTruthy();
  });

  it('n’inclut ni les raisons, ni les actions, ni le score de confiance', async () => {
    const view = await render(<ShareCard result={RESULT} />);
    expect(view.queryByText('Frais réclamés par SMS.')).toBeNull();
    expect(view.queryByText('Ne cliquez pas.')).toBeNull();
    expect(view.queryByText(/0[.,]93|93\s?%/)).toBeNull();
  });
});
