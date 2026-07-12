import { fireEvent, render } from '@testing-library/react-native';

import { SimpleHome } from './simple-home';

const handlers = {
  onVerifyText: jest.fn(),
  onAskContact: jest.fn(),
  onAddContact: jest.fn(),
  onCapture: jest.fn(),
  onLink: jest.fn(),
  onCheckup: jest.fn(),
  onSettings: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

/** Mode simplifié (senior) : un geste dominant, un second si un proche existe. */
describe('SimpleHome', () => {
  it('affiche le grand bouton « Vérifier un message » et pas de bouton proche', async () => {
    const view = await render(<SimpleHome contactFirstName={null} {...handlers} />);
    expect(view.getByText('Vérifier un message')).toBeTruthy();
    expect(view.queryByText(/Demander à/)).toBeNull();
  });

  it('affiche « Demander à [prénom] » quand un proche est enregistré', async () => {
    const view = await render(<SimpleHome contactFirstName="Marie" {...handlers} />);
    expect(view.getByText('Demander à Marie')).toBeTruthy();
  });

  it('affiche la présence rassurante du proche quand il est enregistré', async () => {
    const view = await render(<SimpleHome contactFirstName="Marie" {...handlers} />);
    expect(view.getByText('Marie veille avec vous.')).toBeTruthy();
  });

  it('n’affiche aucune présence de proche quand aucun n’est enregistré', async () => {
    const view = await render(<SimpleHome contactFirstName={null} {...handlers} />);
    expect(view.queryByText(/veille avec vous/)).toBeNull();
  });

  it('propose « Ajouter un proche de confiance » quand aucun n’est enregistré', async () => {
    const view = await render(<SimpleHome contactFirstName={null} {...handlers} />);
    await fireEvent.press(view.getByText('Ajouter un proche de confiance'));
    expect(handlers.onAddContact).toHaveBeenCalledTimes(1);
  });

  it('ne propose pas d’ajout de proche quand un proche existe déjà', async () => {
    const view = await render(<SimpleHome contactFirstName="Marie" {...handlers} />);
    expect(view.queryByText('Ajouter un proche de confiance')).toBeNull();
  });

  it('déclenche les bonnes actions', async () => {
    const view = await render(<SimpleHome contactFirstName="Marie" {...handlers} />);
    await fireEvent.press(view.getByText('Vérifier un message'));
    expect(handlers.onVerifyText).toHaveBeenCalledTimes(1);
    await fireEvent.press(view.getByText('Demander à Marie'));
    expect(handlers.onAskContact).toHaveBeenCalledTimes(1);
  });

  it('garde les autres options accessibles, avec des libellés explicites', async () => {
    const view = await render(<SimpleHome contactFirstName={null} {...handlers} />);
    expect(view.getByLabelText('Vérifier une capture d’écran')).toBeTruthy();
    expect(view.getByLabelText('Vérifier un lien')).toBeTruthy();
    expect(view.getByLabelText('Réglages')).toBeTruthy();
  });

  it('propose une entrée discrète « Vérifier ma protection »', async () => {
    const view = await render(<SimpleHome contactFirstName={null} {...handlers} />);
    await fireEvent.press(view.getByLabelText('Vérifier ma protection'));
    expect(handlers.onCheckup).toHaveBeenCalledTimes(1);
  });
});
