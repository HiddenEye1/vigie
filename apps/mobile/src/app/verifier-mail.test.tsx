import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { AnalyzeResponse } from '@vigie/shared';

import { analyzeText } from '@/lib/api';

import VerifyMailScreen from './verifier-mail';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('expo-clipboard', () => ({ getStringAsync: jest.fn().mockResolvedValue('') }));
jest.mock('@/lib/device-id', () => ({ getDeviceId: jest.fn().mockResolvedValue('device-1') }));
jest.mock('@/lib/api', () => ({
  analyzeText: jest.fn(),
  toApiError: () => ({ message: 'Erreur d’analyse', kind: 'unknown' }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useRouter } = require('expo-router') as { useRouter: jest.Mock };

const RESULT: AnalyzeResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.92,
  category: 'PHISHING_ADMINISTRATION',
  summary: 'Fausse administration.',
  reasons: ['Lien piégé.'],
  actions: ['Ne cliquez pas.'],
  url_analysis: null,
  request_id: 'req-1',
};

beforeEach(() => {
  jest.clearAllMocks();
  useRouter.mockReturnValue({ replace: mockReplace });
});

describe('VerifyMailScreen', () => {
  it('désactive « Vérifier ce mail » tant que le contenu est vide', async () => {
    (analyzeText as jest.Mock).mockResolvedValue(RESULT);
    const view = await render(<VerifyMailScreen />);
    await fireEvent.press(view.getByText('Vérifier ce mail'));
    expect(analyzeText).not.toHaveBeenCalled();
  });

  it('envoie le mail composé (De / Objet / contenu) et route vers le verdict', async () => {
    (analyzeText as jest.Mock).mockResolvedValue(RESULT);
    const view = await render(<VerifyMailScreen />);
    await fireEvent.changeText(view.getByLabelText('Expéditeur du mail'), 'service@impots.fr');
    await fireEvent.changeText(view.getByLabelText('Objet du mail'), 'Remboursement');
    await fireEvent.changeText(view.getByLabelText('Contenu du mail'), 'Cliquez pour recevoir votre dû.');
    await fireEvent.press(view.getByText('Vérifier ce mail'));

    await waitFor(() => {
      expect(analyzeText).toHaveBeenCalledTimes(1);
    });
    expect(analyzeText).toHaveBeenCalledWith(
      'De : service@impots.fr\nObjet : Remboursement\n\nCliquez pour recevoir votre dû.',
      'device-1',
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/verdict/req-1');
    });
  });

  it('affiche l’erreur via ErrorView en cas d’échec', async () => {
    (analyzeText as jest.Mock).mockRejectedValue(new Error('boom'));
    const view = await render(<VerifyMailScreen />);
    await fireEvent.changeText(view.getByLabelText('Contenu du mail'), 'Un contenu.');
    await fireEvent.press(view.getByText('Vérifier ce mail'));
    await waitFor(() => {
      expect(view.getByText('Erreur d’analyse')).toBeTruthy();
    });
  });
});
