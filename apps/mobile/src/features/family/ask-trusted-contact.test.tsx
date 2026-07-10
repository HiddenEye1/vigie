import type { AnalyzeResponse } from '@vigie/shared';
import { render } from '@testing-library/react-native';

import { useTrustedContact } from './contact.store';
import { AskTrustedContact } from './ask-trusted-contact';

const RESULT: AnalyzeResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.93,
  category: 'PHISHING_COLIS',
  summary: 'C’est la fausse notification de colis classique.',
  reasons: ['Frais réclamés par SMS.'],
  actions: ['Ne cliquez pas.'],
  url_analysis: null,
  request_id: 'e58ed763-928c-4155-bee9-fdbaaadc15f3',
};

/** Bouclier famille étape 1 : le bouton n'existe que si un proche est enregistré. */
describe('AskTrustedContact', () => {
  afterEach(() => {
    useTrustedContact.setState({ contact: null });
  });

  it('ne rend rien tant qu’aucun proche n’est enregistré', async () => {
    useTrustedContact.setState({ contact: null });
    const view = await render(<AskTrustedContact result={RESULT} />);
    expect(view.queryByText(/pour avis/)).toBeNull();
  });

  it('affiche « Envoyer à [prénom] pour avis » quand un proche est enregistré', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie Dupont', channel: 'phone', value: '0612345678' },
    });
    const view = await render(<AskTrustedContact result={RESULT} />);
    expect(view.getByText('Envoyer à Marie pour avis')).toBeTruthy();
  });
});
