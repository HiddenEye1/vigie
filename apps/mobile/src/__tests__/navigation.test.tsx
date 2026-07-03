import { fireEvent, renderRouter } from 'expo-router/testing-library';

/**
 * §13 : navigation de base — accueil → écran de saisie.
 * L'état du routeur persistant entre les tests d'un même fichier, le
 * scénario « historique » vit dans son propre fichier (isolation Jest).
 */
describe('navigation — accueil et saisie', () => {
  it('l’accueil affiche l’action principale', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/' });
    expect(await view.findByText('Vigie')).toBeTruthy();
    expect(view.getByText('Vérifier un message')).toBeTruthy();
  });

  it('« Vérifier un message » ouvre l’écran de saisie', async () => {
    const view = await renderRouter('./src/app', { initialUrl: '/' });
    await fireEvent.press(await view.findByText('Vérifier un message'));
    expect(await view.findByLabelText('Message à vérifier')).toBeTruthy();
    expect(view.getByText('Vérifier maintenant')).toBeTruthy();
  });
});
