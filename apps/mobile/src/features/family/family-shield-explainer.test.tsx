import { render } from '@testing-library/react-native';

import { FamilyShieldExplainer } from './family-shield-explainer';

/** Fiche « Comment fonctionne le Bouclier famille ? » — points clés présents. */
describe('FamilyShieldExplainer', () => {
  it('explique le fonctionnement pas à pas, geste par geste', async () => {
    const view = await render(<FamilyShieldExplainer />);
    expect(view.getByText('Vigie prépare un message clair pour votre proche.')).toBeTruthy();
    expect(
      view.getByText('Vous le relisez, puis vous l’envoyez vous-même si vous le souhaitez.'),
    ).toBeTruthy();
    expect(view.getByText(/avant que vous répondiez, cliquiez ou payiez/)).toBeTruthy();
  });

  it('rappelle que le proche ne voit rien sans le geste du senior', async () => {
    const view = await render(<FamilyShieldExplainer />);
    expect(view.getByText('Votre proche ne voit rien automatiquement.')).toBeTruthy();
    expect(
      view.getByText('Il ne reçoit jamais le message d’origine ni vos informations.'),
    ).toBeTruthy();
    expect(view.getByText('Vous pouvez modifier ou retirer ce proche à tout moment.')).toBeTruthy();
  });

  it('distingue le présent local du futur réseau, seulement avec consentement', async () => {
    const view = await render(<FamilyShieldExplainer />);
    expect(view.getByText('Aujourd’hui, tout reste sur ce téléphone.')).toBeTruthy();
    expect(view.getByText(/uniquement si vous l’activez/)).toBeTruthy();
  });
});
