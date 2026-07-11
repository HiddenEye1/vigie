import { render } from '@testing-library/react-native';

import { FamilyPresence } from './family-presence';

/** Présence bienveillante locale : visible seulement si un proche existe. */
describe('FamilyPresence', () => {
  it('ne rend rien tant qu’aucun proche n’est enregistré', async () => {
    const view = await render(<FamilyPresence firstName={null} />);
    expect(view.queryByText(/veille avec vous/)).toBeNull();
  });

  it('affiche « [prénom] veille avec vous » quand un proche est enregistré', async () => {
    const view = await render(<FamilyPresence firstName="Marie" />);
    expect(view.getByText('Marie veille avec vous.')).toBeTruthy();
  });

  it('rappelle que rien n’est montré sans le geste du senior', async () => {
    const view = await render(<FamilyPresence firstName="Marie" />);
    expect(view.getByText(/ce que vous lui montrez/)).toBeTruthy();
  });
});
