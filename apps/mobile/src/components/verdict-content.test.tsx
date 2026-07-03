import type { AnalyzeResponse, VerdictLevel } from '@vigie/shared';
import { render } from '@testing-library/react-native';

import { VERDICT_DISCLAIMER } from '../lib/verdict-ui';
import { VerdictContent } from './verdict-content';

function makeResult(verdict: VerdictLevel): AnalyzeResponse {
  return {
    verdict,
    confidence: 0.87,
    category: verdict === 'PLUTOT_SUR' ? 'AUCUNE' : 'FAUX_CONSEILLER_BANCAIRE',
    summary: 'C’est le scénario classique du faux conseiller bancaire.',
    reasons: ['Votre banque ne demande jamais vos codes.', 'Le message crée une urgence.'],
    actions: ['Raccrochez.', 'Appelez le numéro au dos de votre carte.'],
    url_analysis: null,
    request_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
  };
}

/** §13 : rendu des 4 états de verdict. RNTL v14 : render() est asynchrone. */
describe('VerdictContent', () => {
  it.each([
    ['ARNAQUE_PROBABLE', 'Arnaque très probable'],
    ['SUSPECT', 'Méfiance, plusieurs signaux d’alerte'],
    ['PLUTOT_SUR', 'Aucun signal d’arnaque détecté'],
    ['INDETERMINE', 'Impossible de me prononcer'],
  ] as const)('affiche l’état %s avec son libellé §4.2', async (verdict, expectedLabel) => {
    const view = await render(<VerdictContent result={makeResult(verdict)} />);
    expect(view.getByText(expectedLabel)).toBeTruthy();
  });

  it('affiche résumé, raisons, actions et catégorie', async () => {
    const view = await render(<VerdictContent result={makeResult('ARNAQUE_PROBABLE')} />);
    expect(view.getByText('C’est le scénario classique du faux conseiller bancaire.')).toBeTruthy();
    expect(view.getByText('Pourquoi ?')).toBeTruthy();
    expect(view.getByText('Votre banque ne demande jamais vos codes.')).toBeTruthy();
    expect(view.getByText('Que faire maintenant ?')).toBeTruthy();
    expect(view.getByText('Appelez le numéro au dos de votre carte.')).toBeTruthy();
    expect(view.getByText('Faux conseiller bancaire')).toBeTruthy();
  });

  it('la mention obligatoire est présente sur chaque verdict (§4.2 point 7)', async () => {
    const view = await render(<VerdictContent result={makeResult('PLUTOT_SUR')} />);
    expect(view.getByText(VERDICT_DISCLAIMER)).toBeTruthy();
  });

  it('n’affiche JAMAIS le pourcentage de confiance (§4.2)', async () => {
    const view = await render(<VerdictContent result={makeResult('SUSPECT')} />);
    expect(view.queryByText(/0[.,]87/)).toBeNull();
    expect(view.queryByText(/87\s?%/)).toBeNull();
    expect(view.queryByText(/confiance/i)).toBeNull();
  });

  it('ne montre pas de badge de catégorie quand AUCUNE', async () => {
    const view = await render(<VerdictContent result={makeResult('PLUTOT_SUR')} />);
    expect(view.queryByText('Aucune catégorie')).toBeNull();
  });
});
