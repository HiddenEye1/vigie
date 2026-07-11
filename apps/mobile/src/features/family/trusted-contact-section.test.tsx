import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useTrustedContact } from './contact.store';
import { TrustedContactSection } from './trusted-contact-section';

const PRENOM = 'Prénom du proche de confiance';
const CONTACT = 'Numéro de téléphone ou adresse e-mail du proche';

afterEach(() => {
  useTrustedContact.setState({ contact: null });
  jest.restoreAllMocks();
});

describe('TrustedContactSection', () => {
  it('sans proche, propose l’assistant guidé plutôt que le formulaire brut', async () => {
    const onConfigure = jest.fn();
    const view = await render(<TrustedContactSection onConfigure={onConfigure} />);
    expect(view.queryByLabelText(PRENOM)).toBeNull();
    await fireEvent.press(view.getByText('Configurer mon proche de confiance'));
    expect(onConfigure).toHaveBeenCalledTimes(1);
  });

  it('sans proche, affiche le paragraphe explicatif complet', async () => {
    const view = await render(<TrustedContactSection onConfigure={jest.fn()} />);
    expect(view.getByText(/Choisissez une personne/)).toBeTruthy();
  });

  it('avec un proche, affiche une explication courte (pas le long paragraphe)', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie', channel: 'phone', value: '0612345678' },
    });
    const view = await render(<TrustedContactSection />);
    expect(
      view.getByText('Vous pouvez lui envoyer l’avis de Vigie depuis un résultat.'),
    ).toBeTruthy();
    expect(view.queryByText(/Choisissez une personne/)).toBeNull();
  });

  it('modifie un proche existant via l’édition inline', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie', channel: 'phone', value: '0612345678' },
    });
    const view = await render(<TrustedContactSection />);
    await fireEvent.press(view.getByText('Modifier ce proche'));
    await fireEvent.changeText(view.getByLabelText(PRENOM), 'Paul');
    await fireEvent.changeText(view.getByLabelText(CONTACT), 'paul@example.fr');
    await fireEvent.press(view.getByText('Enregistrer ce proche'));
    expect(useTrustedContact.getState().contact).toEqual({
      name: 'Paul',
      channel: 'email',
      value: 'paul@example.fr',
    });
  });

  it('retire un proche après confirmation', async () => {
    useTrustedContact.setState({
      contact: { name: 'Marie', channel: 'phone', value: '0612345678' },
    });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    });
    const view = await render(<TrustedContactSection />);
    await fireEvent.press(view.getByText('Retirer ce proche'));
    expect(useTrustedContact.getState().contact).toBeNull();
  });
});
