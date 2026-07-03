import { router } from 'expo-router';
import { act, renderRouter } from 'expo-router/testing-library';

import { markOnboardingSeen } from '../lib/onboarding';

beforeAll(async () => {
  // L'onboarding (F9) ne doit pas intercepter les tests de navigation.
  await markOnboardingSeen();
});

/** §13 : navigation de base — onglet Historique (fichier isolé, cf. navigation.test.tsx). */
describe('navigation — historique', () => {
  it('l’onglet Historique s’ouvre et affiche l’état vide', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/' });
    await view.findByText('Vigie');
    act(() => {
      router.navigate('/historique');
    });
    expect(
      await view.findByText(
        'Aucune vérification pour le moment. Vos analyses resteront uniquement sur ce téléphone.',
      ),
    ).toBeTruthy();
  });
});
