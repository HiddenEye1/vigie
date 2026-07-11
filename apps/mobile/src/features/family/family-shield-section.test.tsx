import { fireEvent, render } from '@testing-library/react-native';

import { useTrustedContact } from './contact.store';
import { FamilyShieldSection } from './family-shield-section';

afterEach(() => {
  useTrustedContact.setState({ contact: null });
  jest.clearAllMocks();
});

describe('FamilyShieldSection', () => {
  it('affiche l’entrée « Comment ça marche ? » et déclenche le callback', async () => {
    const onExplain = jest.fn();
    const view = await render(<FamilyShieldSection onExplain={onExplain} />);
    await fireEvent.press(view.getByText('Comment ça marche ?'));
    expect(onExplain).toHaveBeenCalledTimes(1);
  });

  it('n’affiche pas l’entrée quand aucun callback n’est fourni', async () => {
    const view = await render(<FamilyShieldSection />);
    expect(view.queryByText('Comment ça marche ?')).toBeNull();
  });
});
