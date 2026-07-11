import { fireEvent, render } from '@testing-library/react-native';

import { useTrustedContact } from './contact.store';
import { ContactOnboarding } from './contact-onboarding';

const PRENOM = 'Prénom du proche de confiance';
const CONTACT = 'Numéro de téléphone ou adresse e-mail du proche';

afterEach(() => {
  useTrustedContact.setState({ contact: null });
  jest.clearAllMocks();
});

/** Assistant guidé de première configuration d'un proche (100 % local). */
describe('ContactOnboarding', () => {
  it('enregistre le proche au terme des quatre étapes', async () => {
    const onDone = jest.fn();
    const view = await render(<ContactOnboarding onDone={onDone} onCancel={jest.fn()} />);

    await fireEvent.press(view.getByText('Continuer')); // explication → saisie
    await fireEvent.changeText(view.getByLabelText(PRENOM), 'Marie');
    await fireEvent.changeText(view.getByLabelText(CONTACT), '0612345678');
    await fireEvent.press(view.getByText('Continuer')); // saisie → transparence
    await fireEvent.press(view.getByText('Continuer')); // transparence → confirmation
    await fireEvent.press(view.getByText('Enregistrer Marie'));

    expect(useTrustedContact.getState().contact).toEqual({
      name: 'Marie',
      channel: 'phone',
      value: '0612345678',
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('« Continuer » n’avance pas tant que la saisie est incomplète ou invalide', async () => {
    const view = await render(<ContactOnboarding onDone={jest.fn()} onCancel={jest.fn()} />);

    await fireEvent.press(view.getByText('Continuer')); // → saisie
    await fireEvent.press(view.getByText('Continuer')); // désactivé : sans effet
    expect(view.getByText('Qui est votre proche ?')).toBeTruthy();

    await fireEvent.changeText(view.getByLabelText(PRENOM), 'Marie');
    await fireEvent.changeText(view.getByLabelText(CONTACT), 'pas-un-contact');
    await fireEvent.press(view.getByText('Continuer')); // toujours désactivé
    expect(view.getByText('Qui est votre proche ?')).toBeTruthy();

    await fireEvent.changeText(view.getByLabelText(CONTACT), '0612345678');
    await fireEvent.press(view.getByText('Continuer')); // désormais actif
    expect(view.getByText('Ce proche ne voit rien automatiquement')).toBeTruthy();
  });

  it('permet de revenir à l’étape précédente', async () => {
    const view = await render(<ContactOnboarding onDone={jest.fn()} onCancel={jest.fn()} />);
    await fireEvent.press(view.getByText('Continuer')); // → saisie
    expect(view.getByText('Qui est votre proche ?')).toBeTruthy();
    await fireEvent.press(view.getByText('Retour'));
    expect(view.getByText('Choisissez une personne de confiance')).toBeTruthy();
  });

  it('« Annuler » à la première étape quitte le parcours', async () => {
    const onCancel = jest.fn();
    const view = await render(<ContactOnboarding onDone={jest.fn()} onCancel={onCancel} />);
    await fireEvent.press(view.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('rappelle les engagements de transparence avant de confirmer', async () => {
    const view = await render(<ContactOnboarding onDone={jest.fn()} onCancel={jest.fn()} />);
    await fireEvent.press(view.getByText('Continuer'));
    await fireEvent.changeText(view.getByLabelText(PRENOM), 'Marie');
    await fireEvent.changeText(view.getByLabelText(CONTACT), 'marie@example.fr');
    await fireEvent.press(view.getByText('Continuer')); // → transparence
    expect(view.getByText('Ce proche ne voit rien automatiquement')).toBeTruthy();
    expect(view.getByText('Votre proche ne voit rien automatiquement.')).toBeTruthy();
  });

  it('nomme le proche à l’étape de confirmation', async () => {
    const view = await render(<ContactOnboarding onDone={jest.fn()} onCancel={jest.fn()} />);
    await fireEvent.press(view.getByText('Continuer'));
    await fireEvent.changeText(view.getByLabelText(PRENOM), 'Marie');
    await fireEvent.changeText(view.getByLabelText(CONTACT), '0612345678');
    await fireEvent.press(view.getByText('Continuer')); // → transparence
    await fireEvent.press(view.getByText('Continuer')); // → confirmation
    expect(view.getByText(/Marie pourra être contacté/)).toBeTruthy();
  });
});
