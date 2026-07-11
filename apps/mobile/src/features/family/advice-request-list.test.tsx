import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { AdviceRequestList } from './advice-request-list';
import { useAdviceRequests } from './advice-requests.store';

afterEach(() => {
  useAdviceRequests.setState({ entries: [] });
  jest.restoreAllMocks();
});

describe('AdviceRequestList', () => {
  it('ne rend rien quand il n’y a aucune demande', async () => {
    const view = await render(<AdviceRequestList />);
    expect(view.queryByText('Vos demandes récentes')).toBeNull();
  });

  it('affiche les demandes avec un libellé prudent et la note d’honnêteté', async () => {
    useAdviceRequests.setState({
      entries: [
        {
          id: '1',
          date: new Date().toISOString(),
          contactFirstName: 'Marie',
          situation: 'message',
          verdict: 'ARNAQUE_PROBABLE',
        },
      ],
    });
    const view = await render(<AdviceRequestList />);
    expect(view.getByText('Avis demandé à Marie')).toBeTruthy();
    expect(view.getByText(/ne peut pas savoir si le message a été envoyé ou lu/)).toBeTruthy();
    // Jamais de vocabulaire de réception/envoi confirmé.
    expect(view.queryByText(/message envoyé|proche prévenu|a reçu/)).toBeNull();
  });

  it('efface les demandes après confirmation', async () => {
    useAdviceRequests.setState({
      entries: [
        { id: '1', date: new Date().toISOString(), contactFirstName: 'Marie', situation: 'aide' },
      ],
    });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    });
    const view = await render(<AdviceRequestList />);
    await fireEvent.press(view.getByText('Effacer ces demandes'));
    expect(useAdviceRequests.getState().entries).toHaveLength(0);
  });
});
