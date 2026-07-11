import { render } from '@testing-library/react-native';

import { FamilyConsentCard } from './family-consent-card';

/** La carte pose la ligne rouge « veille, pas surveillance » (VISION §3). */
describe('FamilyConsentCard', () => {
  it('affiche le titre « Une veille, pas une surveillance »', async () => {
    const view = await render(<FamilyConsentCard />);
    expect(view.getByText('Une veille, pas une surveillance')).toBeTruthy();
  });

  it('énonce les quatre engagements de la veille consentie', async () => {
    const view = await render(<FamilyConsentCard />);
    expect(view.getByText('Votre proche ne voit rien automatiquement.')).toBeTruthy();
    expect(view.getByText('Rien ne part sans votre geste.')).toBeTruthy();
    expect(view.getByText('Tout reste sur ce téléphone.')).toBeTruthy();
    expect(view.getByText('Vous pouvez arrêter à tout moment.')).toBeTruthy();
  });
});
