import { fireEvent, renderRouter } from 'expo-router/testing-library';

import { useCheckup } from '@/features/checkup';
import { useSeniorMode, useTrustedContact } from '@/features/family';

import { markOnboardingSeen } from '../lib/onboarding';

beforeAll(async () => {
  await markOnboardingSeen();
});

beforeEach(() => {
  useCheckup.getState().reset();
  useTrustedContact.getState().clear();
  useSeniorMode.getState().setSimpleMode(false);
});

describe('accueil — carte Check-up sécurité', () => {
  it('affiche la carte Check-up sur l’accueil (état « never » par défaut)', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/' });
    expect(await view.findByLabelText('Check-up sécurité')).toBeTruthy();
    expect(view.getByText('Faites le point sur votre protection')).toBeTruthy();
  });

  it('ouvre l’écran /checkup au tap sur la carte', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/' });
    await fireEvent.press(await view.findByLabelText('Check-up sécurité'));
    expect(await view.findByText(/Ce n’est pas un test/)).toBeTruthy();
  });
});
