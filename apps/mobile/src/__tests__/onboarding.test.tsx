import { fireEvent, renderRouter } from 'expo-router/testing-library';

/** F9 : onboarding en 3 écrans, puis arrivée sur l'accueil (fichier isolé). */
describe('onboarding', () => {
  it('déroule les 3 écrans puis affiche l’accueil', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/onboarding' });

    expect(await view.findByText('Un doute ? Vérifiez.')).toBeTruthy();
    await fireEvent.press(view.getByText('Continuer'));

    expect(await view.findByText('Comment ça marche')).toBeTruthy();
    await fireEvent.press(view.getByText('Continuer'));

    expect(await view.findByText('Vos données restent à vous')).toBeTruthy();
    await fireEvent.press(view.getByText('Commencer'));

    expect(await view.findByText('Vérifier un message')).toBeTruthy();
  });
});
