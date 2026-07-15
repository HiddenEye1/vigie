import { fireEvent, render } from '@testing-library/react-native';

import { CheckupCard } from './checkup-card';
import type { CheckupItemView } from './checkup.derive';
import { CHECKUP_ITEMS } from './checkup.items';

function viewFor(id: string, state: CheckupItemView['state']): CheckupItemView {
  const def = CHECKUP_ITEMS.find((item) => item.id === id);
  if (def === undefined) {
    throw new Error(`Item ${id} introuvable`);
  }
  return { def, state };
}

const noop = (): void => undefined;

describe('CheckupCard', () => {
  it('affiche le titre, le badge d’état et le conseil « à renforcer »', async () => {
    const view = viewFor('code-sms', 'to-reinforce');
    const screen = await render(
      <CheckupCard view={view} onNavigate={noop} onConfirm={noop} onUnconfirm={noop} />,
    );
    expect(screen.getByText(view.def.title)).toBeTruthy();
    expect(screen.getByText('À renforcer')).toBeTruthy();
    expect(screen.getByText(view.def.advice.pending)).toBeTruthy();
  });

  it('ouvre le parcours associé via « Voir comment »', async () => {
    const onNavigate = jest.fn();
    const view = viewFor('code-sms', 'to-reinforce');
    const screen = await render(
      <CheckupCard view={view} onNavigate={onNavigate} onConfirm={noop} onUnconfirm={noop} />,
    );
    await fireEvent.press(screen.getByLabelText('Voir comment'));
    expect(onNavigate).toHaveBeenCalledWith('/parcours/donner-un-code');
  });

  it('confirme un item déclaratif via son bouton', async () => {
    const onConfirm = jest.fn();
    const view = viewFor('numeros-officiels', 'to-reinforce');
    const screen = await render(
      <CheckupCard view={view} onNavigate={noop} onConfirm={onConfirm} onUnconfirm={noop} />,
    );
    await fireEvent.press(screen.getByLabelText('C’est fait'));
    expect(onConfirm).toHaveBeenCalledWith('numeros-officiels');
  });

  it('partage un rappel (bouton primaire) et garde la confirmation en secondaire', async () => {
    const onShare = jest.fn();
    const onConfirm = jest.fn();
    const view = viewFor('proches-argent', 'to-reinforce');
    const screen = await render(
      <CheckupCard
        view={view}
        onNavigate={noop}
        onConfirm={onConfirm}
        onUnconfirm={noop}
        onShare={onShare}
      />,
    );
    await fireEvent.press(screen.getByLabelText('Leur envoyer un rappel'));
    expect(onShare).toHaveBeenCalledWith('proches-argent');
    // La confirmation déclarative reste disponible, sans cocher automatiquement.
    await fireEvent.press(screen.getByLabelText('Mes proches le savent'));
    expect(onConfirm).toHaveBeenCalledWith('proches-argent');
  });

  it('propose de configurer le proche quand il est « à découvrir »', async () => {
    const onNavigate = jest.fn();
    const view = viewFor('proche', 'to-discover');
    const screen = await render(
      <CheckupCard view={view} onNavigate={onNavigate} onConfirm={noop} onUnconfirm={noop} />,
    );
    await fireEvent.press(screen.getByLabelText('Configurer mon proche'));
    expect(onNavigate).toHaveBeenCalledWith('/family-onboarding');
  });

  it('permet de revenir sur une protection déclarative « en place »', async () => {
    const onUnconfirm = jest.fn();
    const view = viewFor('code-sms', 'in-place');
    const screen = await render(
      <CheckupCard view={view} onNavigate={noop} onConfirm={noop} onUnconfirm={onUnconfirm} />,
    );
    expect(screen.getByText('En place')).toBeTruthy();
    expect(screen.getByText(view.def.advice.inPlace)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Revenir sur cette protection'));
    expect(onUnconfirm).toHaveBeenCalledWith('code-sms');
  });

  it('ne propose pas de « revenir dessus » pour l’item auto en place', async () => {
    const view = viewFor('proche', 'in-place');
    const screen = await render(
      <CheckupCard view={view} onNavigate={noop} onConfirm={noop} onUnconfirm={noop} />,
    );
    expect(screen.queryByLabelText('Revenir sur cette protection')).toBeNull();
  });

  it('mode « proche » : formulation aidant et « Voir comment » (pas de « Configurer »)', async () => {
    const onNavigate = jest.fn();
    const view = viewFor('proche', 'to-discover');
    const screen = await render(
      <CheckupCard
        view={view}
        mode="proche"
        onNavigate={onNavigate}
        onConfirm={noop}
        onUnconfirm={noop}
      />,
    );
    expect(screen.getByText(/Votre proche a-t-il quelqu’un/)).toBeTruthy();
    // Pas de configuration du proche sur ce téléphone (ce n'est pas celui du senior).
    expect(screen.queryByLabelText('Configurer mon proche')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Voir comment'));
    expect(onNavigate).toHaveBeenCalledWith('/comment-fonctionne-bouclier');
  });

  it('mode « proche » : confirme avec le libellé aidant', async () => {
    const onConfirm = jest.fn();
    const view = viewFor('code-sms', 'to-reinforce');
    const screen = await render(
      <CheckupCard
        view={view}
        mode="proche"
        onNavigate={noop}
        onConfirm={onConfirm}
        onUnconfirm={noop}
      />,
    );
    expect(screen.getByText(/Votre proche sait-il quoi faire/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('C’est acquis'));
    expect(onConfirm).toHaveBeenCalledWith('code-sms');
  });
});
