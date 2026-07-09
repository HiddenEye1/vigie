import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Text } from 'react-native';

// Import via l'alias `@/` : valide que le mapping Jest est bien câblé.
import { ErrorBoundary } from '@/components/error-boundary';

function Bomb(): ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('rend ses enfants quand tout va bien', async () => {
    const view = await render(
      <ErrorBoundary>
        <Text>Contenu normal</Text>
      </ErrorBoundary>,
    );
    expect(view.getByText('Contenu normal')).toBeTruthy();
  });

  it('affiche le repli « Gardien » quand un enfant plante', async () => {
    // React journalise l'erreur attendue : on tait le bruit du test.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(view.getByText('Vigie a rencontré un souci')).toBeTruthy();
    expect(view.getByText('Réessayer')).toBeTruthy();
    spy.mockRestore();
  });
});
