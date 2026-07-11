import type { AnalyzeResponse } from '@vigie/shared';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import { useAdviceRequests } from './advice-requests.store';
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

describe('AskTrustedContact — trace locale de la demande', () => {
  afterEach(() => {
    useTrustedContact.setState({ contact: null });
    useAdviceRequests.setState({ entries: [] });
    jest.restoreAllMocks();
  });

  it('enregistre une trace uniquement après ouverture réussie du compositeur', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie Dupont', channel: 'phone', value: '0612345678' },
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    const view = await render(<AskTrustedContact result={RESULT} />);
    await fireEvent.press(view.getByText('Envoyer à Marie pour avis'));

    await waitFor(() => {
      expect(useAdviceRequests.getState().entries).toHaveLength(1);
    });
    const entry = useAdviceRequests.getState().entries[0];
    expect(entry?.contactFirstName).toBe('Marie');
    expect(entry?.situation).toBe('message');
    expect(entry?.verdict).toBe('ARNAQUE_PROBABLE');
    expect(entry?.category).toBe('PHISHING_COLIS');
  });

  it('n’enregistre aucune trace si le compositeur ne peut pas s’ouvrir', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie Dupont', channel: 'phone', value: '0612345678' },
    });
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('aucune application'));
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const view = await render(<AskTrustedContact result={RESULT} />);
    await fireEvent.press(view.getByText('Envoyer à Marie pour avis'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });
    expect(useAdviceRequests.getState().entries).toHaveLength(0);
  });
});
