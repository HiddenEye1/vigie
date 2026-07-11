import { render } from '@testing-library/react-native';

import VerifyImageScreen from './verifier-capture';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

/**
 * Non-régression : le mode Capture reste la voie image par défaut. La voie
 * « texte » (OCR) est masquée tant qu'aucun recognizer n'est disponible.
 */
describe('VerifyImageScreen', () => {
  it('propose de choisir une capture et ne montre pas la voie texte (OCR indisponible)', async () => {
    const view = await render(<VerifyImageScreen />);
    expect(view.getByText('Choisir dans ma galerie')).toBeTruthy();
    expect(view.queryByText('Lire le texte de la capture')).toBeNull();
  });
});
