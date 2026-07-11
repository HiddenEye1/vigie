import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { AnalyzeResponse } from '@vigie/shared';

import { analyzeText } from '@/lib/api';

import { CaptureTextPanel } from './capture-text-panel';
import type { TextRecognizer } from './text-recognizer';
import { unavailableRecognizer } from './text-recognizer';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('@/lib/device-id', () => ({ getDeviceId: jest.fn().mockResolvedValue('device-1') }));
jest.mock('@/lib/api', () => ({
  analyzeText: jest.fn(),
  toApiError: () => ({ message: 'Erreur d’analyse', kind: 'unknown' }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useRouter } = require('expo-router') as { useRouter: jest.Mock };

const IMAGE = { uri: 'file://capture.jpg', mimeType: 'image/jpeg' };

const RESULT: AnalyzeResponse = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.9,
  category: 'PHISHING_COLIS',
  summary: 'Faux colis.',
  reasons: ['Lien piégé.'],
  actions: ['Ne cliquez pas.'],
  url_analysis: null,
  request_id: 'req-1',
};

function okRecognizer(text: string): TextRecognizer {
  return { available: true, recognize: jest.fn().mockResolvedValue({ text }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  useRouter.mockReturnValue({ replace: mockReplace, push: mockPush });
});

describe('CaptureTextPanel', () => {
  it('préremplit le texte reconnu quand l’OCR est disponible', async () => {
    const view = await render(
      <CaptureTextPanel image={IMAGE} recognizer={okRecognizer('Bonjour, un test.')} />,
    );
    await waitFor(() => {
      expect(view.getByDisplayValue('Bonjour, un test.')).toBeTruthy();
    });
  });

  it('détecte les liens du texte reconnu et propose de les analyser', async () => {
    const view = await render(
      <CaptureTextPanel
        image={IMAGE}
        recognizer={okRecognizer('Payez sur https://faux-colis.fr maintenant.')}
      />,
    );
    await waitFor(() => {
      expect(view.getByText('Analyser ce lien')).toBeTruthy();
    });
    await fireEvent.press(view.getByText('Analyser ce lien'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/verifier-lien',
      params: { partage: 'https://faux-colis.fr' },
    });
  });

  it('analyse le texte ÉDITÉ (pas le texte OCR brut) et route vers le verdict', async () => {
    (analyzeText as jest.Mock).mockResolvedValue(RESULT);
    const view = await render(
      <CaptureTextPanel image={IMAGE} recognizer={okRecognizer('Texte OCR brut.')} />,
    );
    await waitFor(() => {
      expect(view.getByDisplayValue('Texte OCR brut.')).toBeTruthy();
    });
    await fireEvent.changeText(view.getByLabelText('Texte de la capture'), 'Texte corrigé par moi.');
    await fireEvent.press(view.getByText('Vérifier ce texte'));

    await waitFor(() => {
      expect(analyzeText).toHaveBeenCalledWith('Texte corrigé par moi.', 'device-1');
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/verdict/req-1');
    });
  });

  it('affiche l’erreur via ErrorView en cas d’échec', async () => {
    (analyzeText as jest.Mock).mockRejectedValue(new Error('boom'));
    const view = await render(
      <CaptureTextPanel image={IMAGE} recognizer={okRecognizer('Un contenu.')} />,
    );
    await waitFor(() => {
      expect(view.getByDisplayValue('Un contenu.')).toBeTruthy();
    });
    await fireEvent.press(view.getByText('Vérifier ce texte'));
    await waitFor(() => {
      expect(view.getByText('Erreur d’analyse')).toBeTruthy();
    });
  });

  it('sans OCR disponible : message « bientôt », champ vide, aucune reconnaissance', async () => {
    const view = await render(<CaptureTextPanel image={IMAGE} recognizer={unavailableRecognizer} />);
    expect(view.getByText(/arrivera prochainement/)).toBeTruthy();
    expect(view.getByDisplayValue('')).toBeTruthy();
  });
});
